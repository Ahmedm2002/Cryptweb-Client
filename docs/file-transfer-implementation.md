# File Transfer Implementation — CryptWeb Client

## Architecture Overview

Peer-to-peer encrypted file transfer over **WebRTC DataChannels** with a **Socket.IO signaling server**. Files flow directly browser-to-browser; the server only facilitates connection establishment and logs transfer metadata.

```
UI Components (FileTransfer*, EmailInput, NetworkUsers, IncomingRequest, Home)
    |
Hooks (useFileTransfer, useAuth)
    |
Socket Hook (useSocket) --> Context (SocketContext)
    |
Socket Layer (socket.js, socket.events.js, socket.handlers.js)
    |
WebRTC Layer (RTCPeer, iceServers.js)
```

---

## 1. Socket Layer (`src/socket/`)

### 1.1 `socket.js` — Socket.IO Singleton

- **Exports:** `socket` (single `Socket` instance)
- **Config:**
  - `autoConnect: false` — manually connected by `SocketContext`
  - `withCredentials: true` — sends cookies for auth
  - `transports: ["websocket"]` — no long-polling fallback
  - `reconnection: true`, `reconnectionDelay: 1000`, `reconnectionDelayMax: 5000`, `reconnectionAttempts: 10`
  - Server URL from `VITE_SOCKET_SERVER_URL` env var

### 1.2 `socket.events.js` — Event Name Constants

| Constant | String Value | Direction | Purpose |
|---|---|---|---|
| `USER_REGISTER` | `user:register` | C→S | Register authenticated user |
| `CONNECTION_REQUEST` | `connection:request` | C→S | Request P2P connection |
| `CONNECTION_INCOMING` | `connection:incoming` | S→C | Notify of incoming request |
| `CONNECTION_RESPONSE` | `connection:response` | C↔S | Accept/reject connection |
| `OFFER` | `offer` | C→S→C | WebRTC SDP offer |
| `ANSWER` | `answer` | C→S→C | WebRTC SDP answer |
| `ICE_CANDIDATE` | `ice-candidate` | C→S→C | ICE candidate exchange |
| `USERS_CONNECTED` | `users:connected` | C→S | Confirm P2P connection established |
| `CONNECT` | `connect` | built-in | Socket connected to server |
| `DISCONNECT` | `disconnect` | built-in | Socket disconnected |
| `PEER_DISCONNECTED` | `peer:disconnected` | S→C | Remote peer disconnected |
| `NETWORK_USERS` | `network:users` | C↔S | Request/receive online users list |
| `NETWORK_USER_JOINED` | `network:user-joined` | S→C | New user joined the network |
| `NETWORK_USER_LEFT` | `network:user-left` | S→C | User left the network |

### 1.3 `socket.handlers.js` — Emit Helpers

Each function guards with `if (!socket) return;`. All are pure emit wrappers.

| Function | Payload |
|---|---|
| `emitRegisterUser(user)` | `{ email, name }` |
| `emitConnectionRequest(from, to)` | `{ from: string, to: string }` |
| `emitConnectionResponse(from, to, accepted)` | `{ from, to, accepted: boolean }` |
| `emitWebRTCOffer(from, to, offer)` | `{ from, to, offer: RTCSessionDescription }` |
| `emitWebRTCAnswer(from, to, answer)` | `{ from, to, answer: RTCSessionDescription }` |
| `emitIceCandidate(from, to, candidate)` | `{ from, to, candidate: RTCIceCandidate }` |
| `emitUsersConnected(initiator, receiver)` | `{ initiator, receiver }` |
| `emitNetworkUsers()` | (no payload) |

---

## 2. WebRTC Layer (`src/webrtc/`)

### 2.1 `iceServers.js` — ICE Configuration

- **STUN:** `stun:stun.l.google.com:19302`, `stun:global.stun.twilio.com:3478`, `stun:stun.relay.metered.ca:80`
- **TURN:** `turn:global.relay.metered.ca:80` (UDP), `turn:global.relay.metered.ca:80?transport=tcp` (TCP), `turn:global.relay.metered.ca:443`, `turns:global.relay.metered.ca:443?transport=tcp` (TLS/TCP)
- All TURN use credentials: `username: "c2d8d546607a6f858bbc5aad"`, `credential: "j3+fryelPOgu3rUx"`

### 2.2 `peer.js` — RTCPeer Class

**Exports:** `RTCPeer` (class)

**Constants:**
- `BUFFER_LOW_THRESHOLD = 262144` (256 KB) — data channel flow control
- `SEND_TIMEOUT_MS = 30000` (30s) — default per-send timeout

**Constructor:** `(socket, localEmail, remotePeerEmail, onConnect, onConnectionFailure)`

**Instance properties:**
| Property | Type | Purpose |
|---|---|---|
| `_socket` | Socket | Socket.IO reference |
| `_retryCount` | number | Current retry (max 5) |
| `_maxRetryCount` | number | 5 |
| `_localEmail` | string | Local user email |
| `_remotePeerEmail` | string | Remote peer email |
| `_onConnect` | fn | Peer connected callback |
| `_onConnectionFailure` | fn | Connection failure callback |
| `_onDataChannelMessage` | fn | Incoming data channel message callback |
| `_isInitiator` | boolean | Whether this side initiated |
| `_rtcConnection` | RTCPeerConnection | The WebRTC connection |
| `_dataChannel` | RTCDataChannel | The data channel |

**Methods:**

| Method | Description |
|---|---|
| `init()` | Creates `RTCPeerConnection` with ICE servers. Sets up `onicecandidate`, `onconnectionstatechange` (connected → `_onConnect`, failed → `handleConnectionFailure`), `ondatachannel`. |
| `createOffer()` | Initiator-only. Creates data channel `"channel:file-transfer"` (`ordered: true`), sets up channel handlers, creates SDP offer, sets local description, emits via `emitWebRTCOffer`. |
| `handleOffer(offer)` | Receiver-only. Guards on `signalingState === "stable"`. Sets remote description, creates answer, sets local description, emits via `emitWebRTCAnswer`. |
| `handleAnswer(answer)` | Sets remote description. |
| `handleIceCandidate(candidate)` | Adds candidate if `remoteDescription` is set. |
| `setupDataChannel()` | Sets `bufferedAmountLowThreshold = 262144`, wires `onopen`/`onmessage`/`onerror`/`onclose`. |
| `isDataChannelOpen()` | `this._dataChannel?.readyState === "open"` |
| `sendData(data, { signal, timeoutMs })` | **Core flow-control method.** Returns a Promise. Algorithm: check abort/channel state → start timeout → register abort listener → `attempt()`: if `bufferedAmount > threshold`, wait for `bufferedamountlow`; else send. Single-shot guard via `settled` bool. |
| `handleConnectionFailure()` | Initiator retries up to 5× by calling `retryConnection()`. Non-initiator calls `_onConnectionFailure`. |
| `retryConnection()` | Closes existing channel + connection, re-initializes, creates new data channel + offer. |
| `close()` | Safely closes data channel + peer connection. |
| `unableToConnect()` | Returns formatted error string. |

---

## 3. Socket Context (`src/context/SocketContext.jsx`)

**Exports:** `SocketContext`, `SocketProvider`

### State Shape

| State | Type | Default | Purpose |
|---|---|---|---|
| `isConnectedWithServer` | boolean | `socket.connected` | Socket.IO connection status |
| `friendStatus` | object | `null` | Status of peer being connected to |
| `incomingRequest` | object | `null` | Incoming connection request |
| `isInitiator` | boolean | `false` | Whether user initiated connection |
| `isConnectedWithFriend` | boolean | `false` | WebRTC peer connected |
| `connectionError` | string | `null` | Error message for UI |
| `connectedFriend` | object | `null` | `{ email, name }` of connected friend |
| `peerDisconnected` | object | `null` | Peer disconnect event data |
| `connectionPhase` | string | `null` | `"requesting"` or `"negotiating"` or `null` |
| `connectingTo` | string | `null` | Display name of connection target |
| `networkUsers` | array | `[]` | Online network users |

### Refs

| Ref | Purpose |
|---|---|
| `peerRef` | Holds `RTCPeer` instance |
| `pendingFriendInfo` | `{ email, name }` of peer being connected to |
| `isInitiatorRef` | Mirror of `isInitiator` for callbacks |
| `dataChannelCallbackRef` | Stores data channel message callback |
| `socketDisconnectTimerRef` | 30s cleanup timer after socket disconnect |

### Socket Event Handlers

**`handleConnect()`** (CONNECT):
1. Clears disconnect timer
2. Sets `isConnectedWithServer = true`
3. Calls `emitRegisterUser(user)`

**`handleDisconnect()`** (DISCONNECT):
1. Sets `isConnectedWithServer = false`
2. Sets `connectionError = "Disconnected from server. Reconnecting..."`
3. Starts 30s timer — if not reconnected, resets ALL state and closes peer

**`onIncomingRequest(data)`** (CONNECTION_INCOMING):
1. Sets `isInitiator = false`
2. Stores data in `incomingRequest`
3. Stores `pendingFriendInfo`

**`onConnectionResponse(data)`** (CONNECTION_RESPONSE):
1. Sets `isInitiator = true`
2. If accepted: creates `RTCPeer`, wires data channel callback, calls `peer.init()` → `peer.createOffer()`
3. If rejected: resets state, sets `connectionError`

**`onOffer(data)`** (OFFER):
1. Closes existing peer, creates new `RTCPeer`
2. Calls `peer.init()` → `peer.handleOffer(data.offer)`

**`onAnswer(data)`** (ANSWER): Calls `peer.handleAnswer(data.answer)`

**`onIceCandidate(data)`** (ICE_CANDIDATE): Calls `peer.handleIceCandidate(data.candidate)`

**`onPeerDisconnected(data)`** (PEER_DISCONNECTED):
1. Stores data in `peerDisconnected` state (triggers modal)
2. Resets all connection state
3. Closes peer

**`onNetworkUsers(users)`** (NETWORK_USERS): Sets `networkUsers`

**`onNetworkUserJoined(data)` / `onNetworkUserLeft(data)`**: Updates `networkUsers` from `data.onlineUsers`

### Exposed Functions

| Function | Signature | Behavior |
|---|---|---|
| `updateFriendsStatus` | `(data)` | Initiator: stores friend info, sets phase `"requesting"`, emits `CONNECTION_REQUEST` |
| `respondToRequest` | `(from, accepted)` | Receiver: emits `CONNECTION_RESPONSE`, clears request, sets phase `"negotiating"` |
| `subscribeToDataChannel` | `(callback)` | Stores callback in ref, wires to peer if exists |
| `sendDataViaWebRTC` | `(data, options)` | Delegates to `peer.sendData()` |
| `isDataChannelOpen` | `()` | Returns boolean |
| `disconnectFromFriend` | `()` | Closes peer, resets state |
| `requestNetworkUsers` | `()` | Emits `NETWORK_USERS` |
| `clearPeerDisconnected` | `()` | Clears disconnect notification |

### Cleanup (on unmount / user change)

Clears disconnect timer, removes ALL socket listeners, closes peer.

---

## 4. Socket Hook (`src/socket/useSocket.js`)

Simple context consumer:

```js
function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
```

---

## 5. File Transfer Hook (`src/hooks/useFileTransfer.js`)

**Exports:** `useFileTransfer`

**Signature:** `useFileTransfer(friendEmail, user, peerDisconnected)`

### Constants

| Constant | Value | Purpose |
|---|---|---|
| `MAX_SEND_RETRIES` | 5 | Max chunk send retries |
| `CHUNK_SIZE` | 65536 (64 KB) | Size of each file chunk |
| `TRANSFER_TIMEOUT_MS` | 60000 (60s) | Transfer inactivity timeout |
| `PROGRESS_THROTTLE_MS` | 80 | Min ms between progress state updates |

### State Shape

| State | Type | Default | Purpose |
|---|---|---|---|
| `selectedFile` | File | `null` | File selected to send |
| `incomingFile` | object | `null` | `{ name, size, type, totalChunks }` |
| `transferProgress` | number | 0 | 0–100 percentage |
| `isTransferring` | boolean | `false` | Transfer in progress |
| `transferComplete` | boolean | `false` | Transfer finished successfully |
| `transferFailed` | boolean | `false` | Transfer failed |
| `receivedBlob` | Blob | `null` | Assembled received file |
| `transferSpeed` | number | 0 | Bytes per second |

### Refs

| Ref | Purpose |
|---|---|
| `receivedChunksRef` | Array of `ArrayBuffer` chunks received |
| `incomingFileRef` | Incoming file metadata |
| `startTimeRef` | `Date.now()` at transfer start |
| `sendRetryCount` | Current retry count |
| `abortControllerRef` | `AbortController` for cancellation |
| `timeoutRef` | Inactivity timeout timer |
| `lastProgressTimeRef` | Last progress update timestamp |
| `lastRenderTimeRef` | Last UI render timestamp (throttle) |
| `headerBufferRef` | Reusable 9-byte header `ArrayBuffer` |

### Wire Protocol — Binary Chunk Format

```
Byte 0:     marker (uint8)        = 0x01
Bytes 1-4:  chunkIndex (uint32 BE)
Bytes 5-8:  totalChunks (uint32 BE)
Bytes 9+:   raw file data (variable)
```

Total header size: **9 bytes**.

### Control Messages (JSON strings over data channel)

**Metadata (sent before chunks):**
```json
{ "type": "metadata", "fileName": "string", "fileSize": 0, "fileType": "MIME", "totalChunks": 0 }
```

**Completion (sent after all chunks):**
```json
{ "type": "complete", "totalChunks": 0, "fileSize": 0 }
```

### Send Flow (`sendSecuredFile`)

1. Guard: no file → return. Channel not open → fail.
2. Reset state, create `AbortController`.
3. `totalChunks = Math.ceil(selectedFile.size / CHUNK_SIZE)`.
4. Send metadata JSON → on success call `sendNextChunk()`, on failure fail.
5. `sendNextChunk()` iterates via an inner `sendChunk()`:
   - `file.slice(offset, offset + CHUNK_SIZE)` → `ArrayBuffer`
   - Prepend 9-byte header via reusable `headerBuffer`
   - Combine into single `Uint8Array`
   - `sendDataViaWebRTC(combined.buffer, { signal, timeoutMs: 60000 })`
   - **On success:** reset retries, increment offset, reset timeout, throttled progress/speed update (80ms throttle). If more chunks → recurse. If done → send `"complete"` JSON signal, set `transferComplete`, call `recordTransfer()`.
   - **On error:** if abort → return. If channel error → fail immediately. Else → retry with exponential backoff (`200ms × retryCount`, max 5).

### Receive Flow (`onMessage`)

Registered via `subscribeToDataChannel(onMessage)`.

**String messages:**
- `"metadata"` — reset chunks array, store file metadata, init transfer state.
- `"complete"` — verify `receivedChunks.length === totalChunks`, verify assembled Blob size matches. If OK → create Blob, store as `receivedBlob`, call `recordTransfer()`. On mismatch → fail.

**Binary messages (ArrayBuffer):**
1. Validate ≥ 9 bytes
2. Read marker (`0x01`), `chunkIndex` (uint32 BE offset 1), `totalChunks` (uint32 BE offset 5)
3. Extract raw data: `data.slice(9)`
4. Push to `receivedChunksRef.current`
5. Throttled progress/speed update (80ms)

### Speed Calculation

- **Receive:** `(progress / 100) * incomingFile.size / elapsed_seconds` (after 0.3s)
- **Send:** `offset / elapsed_seconds` (after 0.3s)

### Timeout / Inactivity

60s timer. Each chunk send/receive resets it. If no progress for 60s → `AbortController.abort()` → transfer fails.

### Cancellation (`cancelTransfer`)

Aborts controller, clears timeout, resets all state, calls `cleanup()`.

### Retry (`retryTransfer`)

Resets failure/completion state, calls `sendSecuredFile()` after 100ms delay.

### Peer Disconnection Handling

`useEffect` watches `peerDisconnected` + `isTransferring`. If peer disconnects mid-transfer → abort + fail.

### Download (`downloadFile`)

Creates object URL from `receivedBlob`, creates temporary `<a>` with `download`, triggers click, cleans up after 1s, calls `clearFile()`.

### Transfer Recording (`recordTransfer`)

POST to `/file-transfers/complete` with:
```json
{ "senderEmail", "receiverEmail", "fileName", "fileSize", "fileType", "timeElapsed", "transferType": "send"|"receive" }
```
Errors silently caught.

### Return Value

```js
{
  selectedFile, setSelectedFile, transferProgress, isTransferring,
  incomingFile, transferComplete, transferFailed, transferSpeed,
  sendSecuredFile, cancelTransfer, retryTransfer, downloadFile, clearFile
}
```

---

## 6. File Transfer Components (`src/components/file-transfer/`)

### 6.1 `FileTransfer.jsx` — Orchestrator

- **Props:** `{ friendEmail, status }`
- **Hooks:** `useAuth()`, `useSocket()`, `useFileTransfer(friendEmail, user, peerDisconnected)`
- **State machine:**
  - `transferFailed` → red error card with "Retry" / "Dismiss"
  - `isTransferring` → `FileTransferProgress` + "Cancel"
  - `transferComplete && !incomingFile` → green success card + "Send Another File"
  - Default → `FileTransferDropzone` + "Send File" button
  - Always renders `FileTransferIncoming` at top (hidden when no incoming file)

### 6.2 `FileTransferDropzone.jsx` — File Selection

- **Props:** `{ selectedFile, setSelectedFile, clearFile, isTransferring }`
- **Features:** Drag-and-drop, click-to-browse, file info display (name, size, type, date), "Remove" button
- **Empty state:** Cloud icon, "Drop a file here", "or click to browse", security badges ("End-to-end encrypted", "Direct transfer")
- **Helpers:** `formatSize(bytes)`, `getFileType(type)`

### 6.3 `FileTransferIncoming.jsx` — Received File Download

- **Props:** `{ incomingFile, transferComplete, downloadFile }`
- Returns `null` if no incoming file or not complete. Otherwise shows filename, size, and "Download" button.

### 6.4 `FileTransferProgress.jsx` — Progress Bar

- **Props:** `{ transferProgress, transferSpeed, incomingFile, selectedFile }`
- Computes transferred bytes from progress percentage
- Shows "Sending"/"Receiving" label, percentage, green bar, transferred/total bytes, speed
- **Helpers:** `formatBytes(bytes)`, `formatSpeed(bytesPerSec)`

---

## 7. Dashboard Components (`src/components/dashboard/`)

### 7.1 `NetworkUsers.jsx` — Online User List

- **Hooks:** `useSocket()`, `useAuth()`
- On mount: calls `requestNetworkUsers()`
- Filters out current user
- `isBusy` = `!!connectionPhase` — disables connect buttons during active connections
- `handleConnect(peer)` → `updateFriendsStatus({ email: peer.email, data: { name, isOnline: true } })`
- UI: header with count + refresh button, user cards with avatar + name + email + "Connect" button

### 7.2 `IncomingRequest.jsx` — Connection Request Modal

- **Props:** `{ request, onRespond }`
- Returns `null` if no request. Otherwise full-screen backdrop-blur modal with name, "Decline" and "Accept" buttons.

---

## 8. Home Page (`src/pages/Home.jsx`)

**Hooks:** `useAuth()`, `useNavigate()`, `useSocket()`

**Layout state machine:**
- No user → redirect to `/login`
- `connectionError` → error banner with dismiss
- `isConnectedWithFriend && connectedFriend` → green "Connected to {name}" bar + disconnect button + refresh warning
- Not connected → title, 3-step instructions, `EmailInput`, `NetworkUsers`
- `incomingRequest` (always) → `IncomingRequest` modal overlay
- `connectionPhase && !isConnectedWithFriend` → pulsing green dot + phase text
- `isConnectedWithFriend` (always) → `FileTransfer` component
- `peerDisconnected` (always) → full-screen modal with icon + message + "Close"

---

## 9. Complete Signaling Flow

```
1.  User A enters User B's email in EmailInput
2.  EmailInput → POST /session/get-friend-status → if online:
3.  updateFriendsStatus() → emitConnectionRequest(A, B)
4.  Server forwards CONNECTION_INCOMING to User B
5.  User B sees IncomingRequest modal
6.  User B clicks "Accept" → respondToRequest(B, true)
7.  emitConnectionResponse(B, A, true) forwarded to User A
8.  SocketContext creates RTCPeer for A
9.  peer.init() → peer.createOffer() → data channel "channel:file-transfer"
10. emitWebRTCOffer(A, B) forwarded to User B
11. SocketContext creates RTCPeer for B
12. peer.init() → peer.handleOffer(offer) → emitWebRTCAnswer(B, A)
13. User A: peer.handleAnswer(answer)
14. ICE candidates exchanged via ICE_CANDIDATE events
15. WebRTC connected → isConnectedWithFriend = true
16. emitUsersConnected(A, B) → server logs connection
```

---

## 10. Complete File Transfer Flow (Send)

```
1.  User selects file via FileTransferDropzone (drag-drop or click)
2.  selectedFile state updated
3.  User clicks "Send File"
4.  sendSecuredFile():
    a. Creates AbortController
    b. totalChunks = ceil(fileSize / 65536)
    c. Sends JSON metadata via data channel
    d. Calls sendNextChunk()
5.  For each 64 KB chunk:
    a. file.slice(offset, offset + CHUNK_SIZE) → ArrayBuffer
    b. Prepends 9-byte binary header [0x01 | chunkIndex | totalChunks]
    c. peer.sendData() handles backpressure (256 KB buffer threshold)
    d. On success: update progress, move to next chunk
    e. On failure: retry up to 5× with exponential backoff
    f. On abort/timeout: fail the transfer
6.  After all chunks:
    a. Send "complete" JSON signal
    b. set transferComplete = true
    c. recordTransfer() → POST /file-transfers/complete
```

---

## 11. Error Handling

| Scenario | Handling |
|---|---|
| Socket disconnect | 30s grace period before full cleanup |
| WebRTC connection failure | Initiator retries up to 5×; receiver fails immediately |
| Connection rejected | Error message displayed, state reset |
| Data channel not open | `transferFailed = true` immediately |
| Chunk send failure | Retry 5× with exponential backoff; channel/abort errors fail immediately |
| Transfer inactivity (60s) | `AbortController.abort()` → transfer fails |
| Peer disconnects mid-transfer | Modal shown, transfer fails |
| Chunk count / file size mismatch | `transferFailed = true` |
| API call failures | `recordTransfer()` silently catches |
| Missing SocketProvider | `useSocket()` throws descriptive error |

---

## 12. Security Model

- **E2E encryption:** WebRTC DataChannels use DTLS-SRTP transport encryption. No additional application-layer encryption.
- **No server storage:** Files flow directly peer-to-peer. Server only handles signaling + metadata logging.
- **Authentication:** Cookie-based (`withCredentials: true`) with JWT auto-refresh.
- **Data channel ordering:** `{ ordered: true }` ensures in-order delivery.

---

## 13. File Index

| File | Purpose |
|---|---|
| `src/socket/socket.js` | Socket.IO singleton |
| `src/socket/socket.events.js` | Event name constants |
| `src/socket/socket.handlers.js` | Emit helper functions |
| `src/socket/useSocket.js` | Context consumer hook |
| `src/context/SocketContext.jsx` | Socket/WebRTC context provider |
| `src/hooks/useFileTransfer.js` | File transfer logic |
| `src/hooks/useAuth.js` | Auth context consumer |
| `src/context/AuthContext.jsx` | Authentication provider |
| `src/webrtc/peer.js` | RTCPeer class |
| `src/webrtc/iceServers.js` | ICE/STUN/TURN config |
| `src/components/file-transfer/FileTransfer.jsx` | Transfer orchestrator |
| `src/components/file-transfer/FileTransferDropzone.jsx` | Drag-drop file selection |
| `src/components/file-transfer/FileTransferIncoming.jsx` | Received file download |
| `src/components/file-transfer/FileTransferProgress.jsx` | Progress bar |
| `src/components/dashboard/NetworkUsers.jsx` | Online users list |
| `src/components/dashboard/ConnectionStatus/IncomingRequest.jsx` | Connection request modal |
| `src/components/EmailInput.jsx` | Email entry form |
| `src/pages/Home.jsx` | Main orchestrating page |
| `src/pages/Dashboard.jsx` | Dashboard layout wrapper |
| `src/services/api.js` | Axios HTTP client |
| `src/utils/logger/devLogger.js` | Dev-only logger |
