# Cryptweb Client — Serverless file sharing application

## Tech Stack

- **React 19** + Vite 8 + React Router DOM 7
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Socket.IO Client 4** for signaling
- **Axios** for HTTP API
- **Lucide React** for icons
- **WebRTC** (native browser API) for P2P data channels
- Font: **Inter** (Google Fonts)
- Dev port: **3007**

---

## Pages & Routes

| Path        | Guard      | Component        | Navbar | Notes                                      |
| ----------- | ---------- | ---------------- | ------ | ------------------------------------------ |
| `/`         | GuestRoute | Product          | Shown  | Landing page, bounce to /home if logged in |
| `/login`    | GuestRoute | Login            | Shown  | Bounce to /home if logged in               |
| `/signup`   | GuestRoute | Signup           | Shown  | Bounce to /home if logged in               |
| `/home`     | AuthRoute  | Dashboard > Home | Hidden | Bounce to /login if logged out             |
| `/profile`  | AuthRoute  | Dashboard > Home | Hidden | Same as /home                              |
| `/settings` | AuthRoute  | Dashboard > Home | Hidden | Same as /home                              |
| `/security` | public     | Security         | Shown  | Marketing page                             |
| `/features` | public     | Features         | Shown  | Marketing page                             |
| `/about`    | public     | About            | Shown  | Marketing page                             |
| `/contact`  | public     | Contact          | Shown  | Marketing page                             |
| `*`         | none       | NotFound         | Shown  | 404 catch-all                              |

### Route Guards (in App.jsx)

- **AuthRoute**: if `!user` → redirect `/login`
- **GuestRoute**: if `user` → redirect `/home`
- **Public routes**: `/security`, `/features`, `/about`, `/contact` — no guard

---

## Authentication Flow

### AuthContext

- **user**: object or null
- **loading**: boolean (initial session check via `GET /session/1`)
- **signup(name, email, password)**: `POST /auth/signup`
- **login(email, password)**: `POST /auth/login`
- **logout()**: `POST /session/logout`

### API Layer (`src/services/api.js`)

- Axios singleton with `withCredentials: true`
- Auto token refresh on 401 (`POST /session/renew`)
- Base URL from `VITE_API_BASE_URL`

---

## Navbar (public pages)

**File**: `src/components/layout/Navbar.jsx`

- `sticky top-0 z-50`
- **Scroll-aware**: transparent (`bg-transparent`) at top, `bg-[#FAFBFD]` with border when scrolled past 50px
- Closes mobile menu on scroll
- Hidden on dashboard routes (`/home`, `/profile`, `/settings`)
- Left: "CRYPTWEB" brand link → `/`
- Center: menu items from `data/menu.js`
- Right: "Get Started" primary button → `/signup`
- Mobile: hamburger with dropdown

### Dashboard Header (inside DashboardLayout)

- `sticky top-0 z-40`, height `h-14`
- User avatar with dropdown → logout → confirmation modal
- No scroll animation

---

## Template Resources

### Tailwind Config

- **No tailwind.config file** — Tailwind v4 with `@tailwindcss/vite` uses CSS-first config
- Custom values expressed inline (`bg-[#FAFBFD]`, `text-[#6c5ce7]`)

### Octagon Grid Pattern (`src/App.css`)

```css
.bg-octagon-grid {
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 4L42 4 56 18 56 42 42 56 18 56 4 42 4 18Z' fill='none' stroke='rgba(0,0,0,0.055)' stroke-width='1'/%3E%3C/svg%3E");
  background-size: 60px 60px;
}
```

- Single octagon per 60×60 tile, `rgba(0,0,0,0.055)` stroke, no fill
- Applied as `absolute inset-0 z-0 bg-octagon-grid pointer-events-none` on the page wrapper
- Spans full page behind content, visible through transparent navbar at top
- **Pages with pattern**: Product, Security, Features, About, Contact, Login, Signup, NotFound
- **Not on**: DashboardLayout, Home (authenticated pages)
- Custom scrollbar: 6px thin, `#d1d5db` thumb, `#9ca3af` hover

### Color Palette

| Token          | Hex                 | Usage                               |
| -------------- | ------------------- | ----------------------------------- |
| Page BG        | `#FAFBFD`           | All page backgrounds                |
| Primary Purple | `#6c5ce7`           | Accents, icons, focus rings, links  |
| Purple Hover   | `#5b4dae`           | Auth page link hover                |
| Light Purple   | `#f5f0fb`           | Icon backgrounds                    |
| Dark Navy      | `#1c1c28`           | Button primary, privacy sections    |
| Gold           | `#c78b4a`           | Section accents, button focus rings |
| Gray-50 → 900  | standard            | Borders, text, backgrounds          |
| Pattern stroke | `rgba(0,0,0,0.055)` | Octagon grid lines                  |

### Button Variants

- **primary**: `bg-[#1c1c28]` text-white, hover `#2a2a3a`, focus `#6c5ce7`
- **secondary**: bg-white, text `#1c1c28`, border `#e8e3dd`, hover `#faf8f5`, focus `#c78b4a`
- **ghost**: text `#6c5ce7`, hover `bg-[#f5f0fb]`, focus `#6c5ce7`

---

## Socket & WebRTC

### Socket Layer (`src/socket/`)

- `socket.js` — IO instance (`autoConnect: false`, transports: websocket)
- `socket.events.js` — Event constants: USER_REGISTER, CONNECTION_REQUEST, OFFER, ANSWER, ICE_CANDIDATE, etc.
- `socket.handlers.js` — Emit helpers

### SocketContext (`src/context/SocketContext.jsx`)

- Manages: connection status, friend status, incoming request, WebRTC signaling
- Provides: `updateFriendsStatus()`, `respondToRequest()`, `subscribeToDataChannel()`, `sendDataViaWebRTC()`, `disconnectFromFriend()`

### Signaling Flow

1. User connects socket → `emitRegisterUser(user)`
2. EmailInput → `POST /session/get-friend-status` → `updateFriendsStatus(data)` → `emitConnectionRequest()`
3. Receiver gets `CONNECTION_INCOMING` → IncomingRequest modal → `respondToRequest()`
4. Initiator creates `RTCPeer` → offer/answer → ICE exchange → data channel open

### WebRTC Peer (`src/webrtc/peer.js`)

- `RTCPeer` class: init, createOffer, handleOffer, handleAnswer, handleIceCandidate, sendData
- Data channel: `"channel:file-transfer"`, `{ ordered: true }`
- Retry logic: max 5 retries on connection failure, initiator-only
- ICE servers: Google + Twilio STUN, Metered TURN (UDP 80/443, TCP 80/443/TLS)

---

## File Transfer

### useFileTransfer Hook (`src/hooks/useFileTransfer.js`)

**Returns**: `{ selectedFile, setSelectedFile, transferProgress, isTransferring, incomingFile, transferComplete, transferSpeed, sendSecuredFile, downloadFile, clearFile }`

**Sending**:

- Reads file in 16KB chunks via FileReader
- Base64 encodes each chunk, sends as JSON over WebRTC data channel
- Tracks `transferSpeed` as `bytesSent / elapsedSeconds`
- 5ms delay between chunks

**Receiving**:

- Incoming `metadata` sets `incomingFile` with `{ name, size, type, totalChunks }`
- Each chunk pushed to ref array, progress from `chunkId / totalChunks`
- On complete: assembles Blob from base64 chunks → `URL.createObjectURL` for download

**Available data**: `selectedFile.size` / `incomingFile.size` for total bytes, `(transferProgress / 100) * totalBytes` for transferred bytes

### FileTransferProgress (`src/components/file-transfer/FileTransferProgress.jsx`)

- Horizontal bar: `h-2.5 bg-gray-100`, fill `bg-gray-900` with `transition-all duration-300`
- Shows: percentage, "X MB / Y MB", speed (e.g., "2.5 MB/s"), filename
- `formatBytes()` utility handles B/KB/MB/GB

### FileTransfer.jsx

- Orchestrates between FileTransferIncoming, FileTransferProgress, FileTransferDropzone
- Conditionally shows one of: progress (when transferring), dropzone (when idle), download (when complete)

---

## Guest Mode

- **Not implemented client-side**. No guest-specific state, registration flow, or transfer limit enforcement exists.
- `GuestRoute` in App.jsx is an unauthenticated route guard (redirects logged-in users), NOT a guest mode.
- `Features.jsx` mentions "Guest users can send up to 1 file" in marketing copy — aspirational only.
- The EmailInput component requires `user.email` — it cannot work without authentication.

---

## Key Files

| File                                                            | Role                                                  |
| --------------------------------------------------------------- | ----------------------------------------------------- |
| `src/App.jsx`                                                   | Provider tree, routing, ConditionalNavbar             |
| `src/App.css`                                                   | Tailwind import, `.bg-octagon-grid`, custom scrollbar |
| `src/context/AuthContext.jsx`                                   | Auth state, session check, login/signup/logout        |
| `src/context/SocketContext.jsx`                                 | Socket connection, WebRTC signaling                   |
| `src/hooks/useFileTransfer.js`                                  | File chunking, send/receive, progress, speed          |
| `src/hooks/useAuth.js`                                          | `useContext(AuthContext)` wrapper                     |
| `src/socket/useSocket.js`                                       | `useContext(SocketContext)` wrapper                   |
| `src/webrtc/peer.js`                                            | RTCPeer class with retry                              |
| `src/webrtc/iceServers.js`                                      | STUN/TURN config                                      |
| `src/services/api.js`                                           | Axios with token refresh                              |
| `src/components/layout/Navbar.jsx`                              | Public sticky nav, scroll-aware background            |
| `src/components/layout/Header.jsx`                              | Dashboard header with user dropdown                   |
| `src/components/layout/DashboardLayout.jsx`                     | Dashboard shell                                       |
| `src/components/file-transfer/FileTransferProgress.jsx`         | Linear progress bar, MB, speed                        |
| `src/components/file-transfer/FileTransfer.jsx`                 | Transfer orchestrator                                 |
| `src/components/file-transfer/FileTransferDropzone.jsx`         | Drag-drop / click file picker                         |
| `src/components/file-transfer/FileTransferIncoming.jsx`         | Download button for received files                    |
| `src/components/EmailInput.jsx`                                 | Friend email lookup + connect                         |
| `src/components/dashboard/ConnectionStatus/IncomingRequest.jsx` | Accept/decline connection modal                       |
| `src/pages/Product.jsx`                                         | Landing page (pattern on page wrapper)                |
| `data/menu.js`                                                  | Navbar menu items                                     |
