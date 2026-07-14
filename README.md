# Cryptweb Client

Serverless file sharing over WebRTC. Files go directly between browsers — nothing is stored on any server.

## Tech Stack

React 19, Vite 8, Socket.IO Client 4 for signaling, Tailwind CSS 4, Lucide React for icons, Inter font from Google Fonts. Dev server runs on port 3007. Axios handles HTTP API calls with automatic token refresh on 401 responses.

## How the whole thing works

Two users authenticate through a backend API (email/password, session managed server-side). Once logged in, they can look up another user by email and send a connection request. If the recipient accepts, a WebRTC peer connection is established directly between their browsers. From that point on, files can be sent without any server involvement — the data flows P2P over an encrypted data channel.

The backend only handles authentication, user lookup, online status, and WebRTC signaling (passing offers, answers, and ICE candidates between peers). It never sees file content, file names, or any transfer metadata.

## Signaling flow in detail

1. Both users register their presence on the socket with their email as soon as the socket connects. The server uses this to know who is online.

2. User A types User B's email into the EmailInput component. The app calls a backend endpoint to get B's online status. If B is online, `updateFriendsStatus()` triggers an automatic connection request emit over the socket.

3. User B receives a `connection:incoming` socket event. A modal pops up showing A's name with Accept and Decline buttons.

4. If B accepts, the server relays the acceptance back to A. A's side creates an `RTCPeer` instance and generates an SDP offer, which gets sent over the socket to B.

5. B receives the offer, creates their own `RTCPeer` instance, and generates an SDP answer, sent back over the socket.

6. Both sides exchange ICE candidates as they discover them. Once the ICE gathering completes and connectivity is established, the data channel opens.

7. When the data channel opens (`onPeerConnected` fires on both sides), both clients emit `users:connected` with `{ initiator, receiver }` so the server knows who is paired. This lets the server send a `peer:disconnected` event if either user drops off.

## Peer connection management (`src/webrtc/peer.js`)

The `RTCPeer` class wraps a single `RTCPeerConnection`. It creates a data channel named `channel:file-transfer` with ordered delivery enabled. The class handles the full lifecycle: initialization, creating and handling offers/answers, processing ICE candidates, and sending data.

### Backpressure in sendData

The most important detail in this file is how `sendData()` handles flow control. When you send data over an RTCDataChannel faster than the remote side can consume it, the browser's internal buffer fills up. If you keep sending, Chrome (and other browsers) throw an `OperationError` with "RTCDataChannel send queue is full".

To prevent this, `sendData()` checks `bufferedAmount` against a threshold of 256KB before every send. If the buffer is already too full, the message goes into a `_pendingSends` array instead of being written to the channel. The method returns a promise that resolves when the data is actually sent. The `bufferedamountlow` event fires when the buffer drains below the threshold, and `_flushPendingSends()` writes queued messages at that point.

This makes the data channel self-regulating. The remote side's receiving speed controls how fast we send. No messages are dropped, and no errors are thrown due to buffer overflow.

### ICE server configuration

The config uses Google's public STUN server, Twilio's STUN server, and Metered's TURN servers with fallback transports (UDP 80/443, TCP 80/443, TLS 443). The TURN relay is only used when a direct P2P connection cannot be established (symmetric NATs, corporate firewalls, etc.).

## File transfer mechanics (`src/hooks/useFileTransfer.js`)

This is a custom React hook that handles both sending and receiving files through the data channel. It takes the friend's email, the current user object, and a `peerDisconnected` flag from socket context.

### Sending a file

When `sendSecuredFile()` is called, it does the following:

1. **Metadata first**: A JSON message of type `metadata` is sent containing the file name, file size in bytes, MIME type, and the total number of chunks. This tells the receiver what is coming and lets them show the file name and size immediately. If this initial send fails, the transfer is marked as failed right away — no retry, because the channel must be healthy for anything to work.

2. **Chunking loop**: The file is read in 16KB chunks using `File.slice()` and `arrayBuffer()`. Each chunk is converted to a base64 string and wrapped in a JSON message with the chunk index (1-based), total chunks, the base64 data, and an `isCompleted` flag that is true only for the last chunk.

3. **Chunk-by-chunk sending**: Each chunk is sent by awaiting `sendDataViaWebRTC()`, which goes through the peer.js backpressure system. After each successful send, the progress percentage is updated and the transfer speed is recalculated. A 5ms `setTimeout` gap between chunks prevents tight-loop starvation of the React renderer.

4. **Retry on failure**: If a chunk send fails (the promise rejects), the hook increments a retry counter and retries the same chunk up to 5 times with a 200ms gap between attempts. If the retry counter exceeds 5 or the transfer has been cancelled externally, the transfer is marked as `transferFailed` and the UI switches to an error state with a Retry button. The retry logic uses exponential-ish backoff — 200ms is short enough not to feel stuck but long enough for transient channel issues to resolve.

5. **Speed tracking**: When the first chunk is sent, `startTime` is recorded. After each successful chunk, the speed is computed as `totalBytesSent / (Date.now() - startTime)`. This gives a running average in bytes per second. The speed value is exposed as `transferSpeed` and displayed in the progress bar.

### Receiving a file

The `onMessage` callback processes every incoming JSON message on the data channel:

1. **Metadata handler**: When a message with `type: "metadata"` arrives, it creates an `incomingFile` object with the name, size, type, and total chunk count. The receiving state is initialized: chunks array is cleared, progress resets to 0, transfer starts, and the timer begins.

2. **Chunk handler**: Each chunk message (either `type: "chunk"` or containing a `data` field) is pushed into the `incomingChunks` ref array. Progress is recalculated as `(chunkId / totalChunks) * 100`. Speed is computed the same way as on the sending side.

3. **Completion**: When a message with `isCompleted: true` is received, all chunks are assembled into a Blob. The assembly works by base64-decoding each chunk into a byte array, wrapping them in `Uint8Array`, and creating a single `Blob` from the full array. The blob is stored in state and exposed as `receivedBlob`, which the UI uses to offer a download button.

### Cancellation and peer disconnect

If the `peerDisconnected` prop changes to truthy while a transfer is active, a separate `useEffect` in the hook fires. It sets `cancelledRef.current = true` (which stops the send loop), marks the transfer as failed, and clears speed. The UI then shows the same failed state with the Retry button. This is much faster than waiting for the send retries to exhaust naturally.

### Clearing state

`clearFile()` resets everything: selected file, incoming file, progress, transfer state, received blob, chunks array, start time, speed, and retry counter. It also sets `cancelledRef` so any in-flight async loop exits cleanly.

## Peer disconnect handling

When one user closes their tab, loses network, or navigates away, the server detects the socket disconnect and emits a `peer:disconnected` event to the other user with `{ name, email, message }`. For example: "John went offline. Try again later."

SocketContext listens for this event, closes the RTCPeer instance, clears the connected state, and stores the disconnect data in `peerDisconnected` state. The Home page checks for this state and renders a fixed-position modal overlay with a `WifiOff` icon, the backend's message text, and a single Close button. The modal has no other escape — clicking the backdrop does nothing, and there is no reconnect button. The user must acknowledge the disconnect by clicking Close.

If a file transfer was happening, the useFileTransfer hook already cancelled it via the `peerDisconnected` effect, so the user returns to the "Transfer Failed" card after closing the modal.

## Authentication flow

The app uses AuthContext for state management. On mount, it calls `GET /session/1` to check for an existing session. If the response is 200, the user object is stored. If 401, the user stays logged out.

Login sends the email and password to `POST /auth/login`. Signup sends name, email, and password to `POST /auth/signup`. Logout calls `POST /session/logout` on the server.

API calls go through a single Axios instance configured with `withCredentials: true` (cookies are used for session management). On any 401 response, the interceptor tries `POST /session/renew` to refresh the token. If that also fails, the user is logged out.

## Routing

The app uses React Router DOM v7 with three guard types. AuthRoute wraps authenticated pages (Home, Profile, Settings) — if the user is null, it redirects to `/login`. GuestRoute wraps login/signup/landing pages — if the user is logged in, it redirects to `/home`. Public routes (Security, Features, About, Contact) have no guard and are accessible to everyone.

The Navbar is visible on all public pages and hidden on dashboard routes. It has a scroll-aware background: transparent when at the top of the page, solid when scrolled down, so the background pattern shows through initially.

The DashboardLayout wraps `/home`, `/profile`, and `/settings` with a sidebar-like structure (though currently all three point to the same Home component).

## Key files

| File | What it does |
|------|-------------|
| `src/context/SocketContext.jsx` | Socket connect/disconnect lifecycle, WebRTC signaling orchestration (offer/answer/ICE), peer disconnect detection, connection state management |
| `src/context/AuthContext.jsx` | Session check on load, login/signup/logout methods, user state |
| `src/webrtc/peer.js` | RTCPeerConnection wrapper with data channel, backpressure-safe `sendData()` with bufferedAmount threshold and pending queue |
| `src/webrtc/iceServers.js` | STUN and TURN server list (Google, Twilio, Metered) |
| `src/hooks/useFileTransfer.js` | File chunking into 16KB pieces, base64 encoding, async send loop with 5 retries, progress tracking, speed calculation, receive-side chunk assembly into Blob, peer disconnect auto-cancel |
| `src/socket/socket.events.js` | Socket event name constants |
| `src/socket/socket.handlers.js` | Typed emit helper functions |
| `src/services/api.js` | Axios singleton with cookie forwarding and silent token refresh on 401 |
| `src/components/file-transfer/FileTransfer.jsx` | Transfer UI orchestrator showing dropzone, progress bar, download button, or failed state with retry |
| `src/components/file-transfer/FileTransferProgress.jsx` | Linear progress bar with percentage, megabytes transferred, and speed display |
| `src/components/file-transfer/FileTransferDropzone.jsx` | Drag-and-drop zone with click-to-browse fallback |
| `src/components/file-transfer/FileTransferIncoming.jsx` | Received file download button |
| `src/components/EmailInput.jsx` | Email lookup text field with connect button, triggers signaling flow |
