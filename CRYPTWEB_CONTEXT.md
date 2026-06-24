# Cryptweb Client — Full Project Context for AI Upgradation

This document provides complete context about the **Cryptweb-Client** project — a peer-to-peer (P2P) secure file transfer web application built with React. Use this to understand the entire codebase structure, UI/UX patterns, architecture, and implementation details before making changes.

---

## 1. Project Overview

**Purpose:** A web app that lets users securely transfer files directly between browsers using WebRTC data channels. Files never touch any intermediate server — only signaling/metadata passes through the backend.

**Tech Stack:**

- React 19 (JSX, no TypeScript)
- React Router DOM v7
- Vite 8 (build tool)
- Tailwind CSS v4 (styling, utility-first, no config file needed)
- Axios (HTTP client)
- Socket.IO Client v4 (WebSocket signaling)
- WebRTC (RTCPeerConnection + DataChannel for P2P)
- Lucide React (icons)
- Google Fonts: Inter (weights 400–900)

**Environment Variables** (`.env`):

```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_SOCKET_SERVER_URL=http://localhost:3000
VITE_PORT=3007
VITE_METERED_API_KEY=a414b2c045de847c7733d1157c2b712b31c2
```

---

## 2. Project File Structure

```
cryptweb-client/
├── index.html                          # HTML entry, loads Inter font
├── vite.config.js                      # Vite: React + Tailwind plugin, port 3007
├── vercel.json                         # SPA rewrites for Vercel
├── package.json
├── .env
├── data/
│   └── menu.js                         # Navbar menu items array
└── src/
    ├── main.jsx                        # React entry: StrictMode > App
    ├── App.jsx                         # Root: AuthProvider > SocketProvider > Router + Routes + Guards
    ├── App.css                         # @import "tailwindcss"; body { font-family: Inter }
    ├── services/
    │   └── api.js                      # Axios singleton with 401 retry interceptor
    ├── context/
    │   ├── AuthContext.jsx              # User session, login, signup, logout
    │   └── SocketContext.jsx            # Socket.IO + WebRTC connection lifecycle
    ├── hooks/
    │   ├── useAuth.js                  # useContext(AuthContext) shortcut
    │   └── useFileTransfer.js          # Chunked file send/receive via WebRTC data channel
    ├── socket/
    │   ├── socket.js                   # Socket.IO singleton (autoConnect: false)
    │   ├── socket.events.js            # Event name constants
    │   ├── socket.handlers.js          # Emit helper functions
    │   └── useSocket.js                # useContext(SocketContext) shortcut
    ├── webrtc/
    │   ├── iceServers.js               # STUN + TURN server config (Metered.ca, Google, Twilio)
    │   └── peer.js                     # RTCPeer class: WebRTC connection + data channel + retry
    ├── pages/
    │   ├── Product.jsx                 # Landing/marketing page
    │   ├── Login.jsx                   # Sign-in page
    │   ├── Signup.jsx                  # Registration page
    │   ├── Security.jsx                # Security architecture info page
    │   ├── Dashboard.jsx               # Protected wrapper: DashboardLayout > Home
    │   ├── Home.jsx                    # Main authenticated page (file transfer hub)
    │   └── VerifyEmail.jsx             # (Commented out from router) OTP verification
    ├── components/
    │   ├── commons/
    │   │   ├── Button.jsx              # Primary/secondary button
    │   │   ├── Loader.jsx              # Full-screen spinning loader
    │   │   ├── Popup.jsx               # Modal with backdrop, ESC/click-outside close
    │   │   ├── Banner.jsx              # Info banner with action button
    │   │   └── StatusBar.jsx           # Peer online/offline indicator
    │   ├── layout/
    │   │   ├── Navbar.jsx              # Public top nav with mobile hamburger
    │   │   ├── DashboardLayout.jsx     # Authenticated layout: Header + content + logout modal
    │   │   ├── Header.jsx              # Dashboard header: branding + user avatar dropdown
    │   │   └── Sidebar.jsx             # Disabled (returns null)
    │   ├── EmailInput.jsx              # Friend email input + connect button
    │   ├── dashboard/
    │   │   └── ConnectionStatus/
    │   │       └── IncomingRequest.jsx # Accept/decline connection request modal
    │   ├── file-transfer/
    │   │   ├── FileTransfer.jsx        # Orchestrator: incoming, dropzone, progress, send
    │   │   ├── FileTransferDropzone.jsx# Drag-and-drop file upload area
    │   │   ├── FileTransferIncoming.jsx# Incoming file notification + download
    │   │   └── FileTransferProgress.jsx# Circular progress indicator
    │   └── webrtc/
    │       ├── PeerConnectionStatus.jsx# Secure P2P badge
    │       ├── TransferItem.jsx        # Transfer row: progress bar, speed, ETA, status
    │       └── TransferList.jsx        # Transfer history list
```

---

## 3. Routing & Route Guards (`src/App.jsx`)

| Path        | Component       | Guard      | Description                  |
| ----------- | --------------- | ---------- | ---------------------------- |
| `/`         | Product         | GuestRoute | Landing page                 |
| `/login`    | Login           | GuestRoute | Sign-in form                 |
| `/signup`   | Signup          | GuestRoute | Registration form            |
| `/home`     | Dashboard       | AuthRoute  | File transfer hub            |
| `/profile`  | Dashboard       | AuthRoute  | Same dashboard (placeholder) |
| `/settings` | Dashboard       | AuthRoute  | Same dashboard (placeholder) |
| `/security` | Security        | none       | Public security page         |
| `*`         | Navigate to `/` | none       | Catch-all                    |

**Guards:**

- **GuestRoute**: If `user` exists → redirect to `/home`; else render children
- **AuthRoute**: If no `user` → redirect to `/login`; else render children
- Both show `Loader` while `loading === true`

**ConditionalNavbar**: Hides the public Navbar on paths `/home`, `/profile`, `/settings`.

**Provider hierarchy**: `AuthProvider > SocketProvider > BrowserRouter > Routes`

---

## 4. Auth System (`src/context/AuthContext.jsx`)

- On mount, checks session via `GET /session/1`
- `login(email, password)` → `POST /auth/login`
- `signup(name, email, password)` → `POST /auth/signup`
- `logout()` → `POST /session/logout`
- State: `{ user, loading }` — user object from backend
- `VerifyEmail` flow is commented out (both context methods and route)
- Auth uses cookie-based sessions (`withCredentials: true`)

---

## 5. Socket + WebRTC Architecture (`src/context/SocketContext.jsx`)

### Socket.IO lifecycle:

1. On `user` available, socket connects
2. On `connect`, emits `user:register` with user email/name
3. Listens for: `connection:incoming`, `connection:response`, `offer`, `answer`, `ice-candidate`

### Connection flow:

1. **Initiator**: enters friend's email → `EmailInput` calls `POST /session/get-friend-status`
2. If online → `SocketContext.updateFriendsStatus()` → emits `connection:request`
3. **Recipient**: receives `connection:incoming` → `IncomingRequest` modal shows → Accept/Decline
4. On accept → `connection:response` with `accepted: true`
5. Original initiator creates `RTCPeer` → creates offer
6. Recipient receives offer → creates answer
7. ICE candidates exchanged → P2P connection established

### RTCPeer class (`src/webrtc/peer.js`):

- Creates `RTCPeerConnection` with STUN/TURN servers
- Creates `DataChannel` named `channel:file-transfer` (ordered)
- Automatic retry on connection failure (up to 5 tries, initiator only)
- Callbacks: `onConnect`, `onConnectionFailure`, `_onDataChannelMessage`

### ICE Servers (`src/webrtc/iceServers.js`):

- Google STUN, Twilio STUN
- Metered.ca STUN + TURN (TCP, UDP, TLS)

---

## 6. File Transfer System (`src/hooks/useFileTransfer.js`)

### Sending:

1. File read in **16KB chunks** via `FileReader.readAsArrayBuffer`
2. Each chunk converted to base64 via `btoa`
3. First message is `{ type: "metadata", fileName, fileSize, fileType, totalChunks }`
4. Subsequent messages: `{ chunkId, totalChunks, data: base64String, isCompleted }`
5. Sent via `sendDataViaWebRTC()` → `RTCPeer.sendData()` → `dataChannel.send()`

### Receiving:

1. Metadata message → sets `incomingFile` state
2. Each chunk message → pushed to `incomingChunks.current[]`
3. On `isCompleted: true` → calls `assembleBlob()` which:
   - Decodes base64 with `atob()`
   - Converts to `Uint8Array`
   - Creates `Blob`
4. Download via `URL.createObjectURL` + hidden `<a>` click

---

## 7. UI/UX Design Patterns

### Color Palette:

- **Backgrounds**: `bg-white`, `bg-gray-50` (page backgrounds)
- **Text**: `text-gray-900` (headings), `text-gray-600`/`text-gray-500` (body/labels)
- **Primary accent**: `text-indigo-600`, `bg-indigo-50`, `border-indigo-600`
- **Dark sections**: `bg-gray-900 text-white` (privacy/security sections)
- **Borders**: `border-gray-100`, `border-gray-200`
- **Inputs**: `bg-gray-50 border-gray-200`, focus ring `ring-indigo-600`
- **Errors**: `text-red-700 bg-red-50 border-red-100`
- **Success**: `text-green-600 bg-green-50` (WebRTC components)

### Typography:

- Font: Inter (Google Fonts, weights 400-900)
- Base: `font-sans antialiased text-gray-900`
- Headings: `font-bold tracking-tight`
- Body: `font-medium` (unusual — medium weight used for body text)

### Layout:

- **Public pages**: Full pages with borders between sections, max-w-7xl containers
- **Auth forms**: Centered card (`sm:max-w-md`, `sm:rounded-3xl`, `sm:shadow-sm sm:border`)
- **Dashboard**: `min-h-screen` with sticky `Header`, content in `max-w-3xl` centered container

### Spacing & Sizing:

- Section padding: `py-24` (96px), `pt-24 pb-32` (hero)
- Card padding: `p-8` to `p-12`
- Form input padding: `px-4 py-3`
- Border radius: `rounded-xl`, `rounded-2xl`, `rounded-3xl`
- Button padding: `px-4 py-2` (default), `px-8 py-4` (hero CTA)
- Gap: `gap-4`, `gap-6`, `gap-8`, `gap-16`

### Responsive Behavior:

- Mobile-first with `sm:`, `lg:` breakpoints
- Navbar: hamburger menu on `lg:hidden`, desktop links on `hidden lg:flex`
- Auth forms: full width on mobile, centered card on `sm:`
- Landing page: `flex-col lg:flex-row` for hero/content sections
- Feature cards: `w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.333rem)]`
- Dashboard: centered `max-w-3xl` on desktop, full width on mobile

### Shadows & Depth:

- Cards: `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`
- Navbar: `sticky top-0 z-50`, `shadow-xl` on mobile menu
- Modals: `shadow-xl`, backdrop `bg-black/20` or `bg-black/40 backdrop-blur-sm`
- Hover: `hover:shadow-md`, `hover:shadow-lg` transitions

### Animations:

- `transition-all duration-300` (common)
- `transition-colors duration-200` (buttons, links)
- `animate-spin` (Loader)
- `animate-pulse` (connection indicator, progress bar)
- `group-hover:translate-x-1` (arrow on buttons)
- `hover:-translate-y-2` (hero feature cards)
- Popup: scale + translateY + opacity transitions for open/close
- Mobile menu: `max-h-0 → max-h-[400px]` with opacity

### Modals:

- **IncomingRequest**: Simple centered modal, no close X, must Accept/Decline
- **Popup component**: Animated backdrop + content, ESC key, click-outside, close X button
- **Logout confirm**: Inline in DashboardLayout, centered modal with Cancel/Logout

### Icons (Lucide React):

- `Shield`, `Lock`, `EyeOff` — security indicators
- `UploadCloud`, `Download`, `ArrowUp` — file operations
- `File`, `X`, `XCircle` — file selection/cancel
- `CheckCircle`, `AlertCircle` — transfer status
- `LogOut` — disconnect/logout
- `Users`, `Zap`, `Share2`, `Server` — feature icons
- `ArrowRight` — CTA arrows

---

## 8. Component Details

### Common Components:

**Button** (`src/components/commons/Button.jsx`):

- `variant="primary"` → `bg-gray-900 text-white hover:bg-gray-800`
- `variant="secondary"` → `bg-white text-gray-700 border border-gray-200 hover:bg-gray-50`
- Disabled: `opacity-50 cursor-not-allowed`
- Focus: `focus:ring-2 focus:ring-offset-2`

**Loader** (`src/components/commons/Loader.jsx`):

- Full screen centered spinner
- `w-8 h-8 border-4 border-gray-300 border-t-gray-900 animate-spin`

**Popup** (`src/components/commons/Popup.jsx`):

- Fixed overlay with backdrop
- ESC key closes, click-outside closes
- Animated with scale + translateY
- Delayed unmount (200ms for exit animation)

**Banner** (`src/components/commons/Banner.jsx`):

- Gray background, left border accent (gray-900)
- Optional action button, flex row on desktop

**StatusBar** (`src/components/commons/StatusBar.jsx`):

- Shows friend online/offline status
- Green pulsing dot when online, gray when offline

### Layout:

**Navbar** (`src/components/layout/Navbar.jsx`):

- Sticky top, border-bottom, white bg, z-50
- Desktop: centered nav links + "Get Started" CTA
- Mobile: hamburger → animated X icon, slide-down menu
- Closes on scroll, outside click, or link click
- Accessibility: `role="navigation"`, `aria-expanded`, `aria-controls`, `tabIndex`
- Menu items from `data/menu.js`: Home, Security, Features, About, Contact

**DashboardLayout** (`src/components/layout/DashboardLayout.jsx`):

- Sticky Header at top
- Content area: `max-w-3xl mx-auto px-4 py-6`
- Inline logout confirmation modal

**Header** (`src/components/layout/Header.jsx`):

- "CRYPTWEB" branding, user avatar (first letter of name), dropdown
- Dropdown: click-outside closes, contains Logout button

### Feature Components:

**EmailInput** (`src/components/EmailInput.jsx`):

- Email input + "Connect" button
- Validates: not empty, not self-email
- Calls `POST /session/get-friend-status`
- Shows error/offline status inline
- `updateFriendsStatus()` triggers socket connection request

**IncomingRequest** (`src/components/dashboard/ConnectionStatus/IncomingRequest.jsx`):

- Full-screen backdrop modal (no close X)
- Shows "Connection Request" + friend name
- Accept (gray-900) / Decline (gray-100) buttons
- Calls `respondToRequest(fromEmail, accepted)` → emits `connection:response`

**FileTransfer** (`src/components/file-transfer/FileTransfer.jsx`):

- Orchestrates the transfer UI
- Shows `FileTransferIncoming` if file received
- Shows `FileTransferProgress` during transfer
- Shows `FileTransferDropzone` + "Send File" button when idle

**FileTransferDropzone** (`src/components/file-transfer/FileTransferDropzone.jsx`):

- Drag-and-drop zone with visual feedback (border + bg on drag)
- Click to browse via hidden input
- Shows file info when selected: name, size, type, modified date
- "Remove" button to clear selection
- Security badges: "End-to-end encrypted", "Direct transfer", "Files never touch any server"

**FileTransferProgress** (`src/components/file-transfer/FileTransferProgress.jsx`):

- SVG circular progress ring
- Percentage in center, "Sending..."/"Receiving..." label
- Speed in MB/s, file name

**FileTransferIncoming** (`src/components/file-transfer/FileTransferIncoming.jsx`):

- Shows when incoming file transfer completes
- File name + size + "Download" button

**PeerConnectionStatus** (`src/components/webrtc/PeerConnectionStatus.jsx`):

- Badge: green "Secure P2P Connection Active" or gray "Waiting for Peer"

**TransferItem** (`src/components/webrtc/TransferItem.jsx`):

- Individual transfer row with progress bar, speed, ETA, status icon
- Statuses: transferring, completed (green), error (red), cancelled (red)

**TransferList** (`src/components/webrtc/TransferList.jsx`):

- Header "File Transfers" + "Clear Completed" button
- Scrollable list of TransferItems

---

## 9. State Management

No external state library. Uses React Context API:

- **AuthContext**: user session, login/signup/logout
- **SocketContext**: socket connection, WebRTC peer lifecycle, friend status
- **Local state (useState)**: forms, file selection, transfer progress, UI toggles
- **useRef**: peer instance, incoming chunks buffer, pending friend info, dropdown refs, file input ref

---

## 10. Key Observations & Problem Areas

1. **No TypeScript** — all JSX, no type safety
2. **No i18n** — all text hardcoded in English
3. **No dark mode** — light theme only
4. **No testing** — no test framework configured
5. **Sidebar is disabled** — returns `null`
6. **VerifyEmail is dead code** — route + context methods commented out
7. **Dashboard routes** (`/profile`, `/settings`) all render the same `Dashboard > Home`
8. **Google OAuth buttons are UI only** — no actual OAuth implementation
9. **No loading states** on most pages/transitions (only AuthRoute shows Loader)
10. **No error boundaries** — any render crash will blank the page
11. **No proper SEO** — no react-helmet or meta tags per page
12. **WebRTC transfer is base64** — 33% overhead. Could use ArrayBuffer
13. **No transfer pause/resume/cancel** — Cancel UI exists in TransferItem but not wired to hooks
14. **No offline support** — no service worker, no PWA manifest
15. **No rate limiting or input sanitization** on client side
16. **Form validation is minimal** — only checks empty fields, no email format validation
17. **No file size limits** — big files will consume lots of memory (base64 + Blob)
18. **`font-medium` used for body text** — unusual, typically `font-normal`
19. **`text-[15px]` inline font sizes** — breaks Tailwind convention
20. **Footer links** link to `#` — plaVceholder only

---

## 11. API Endpoints Used

| Method | Endpoint                     | Purpose                            |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/session/1`                 | Check existing session             |
| POST   | `/auth/signup`               | Register new user                  |
| POST   | `/auth/login`                | Authenticate user                  |
| POST   | `/session/logout`            | Destroy session                    |
| POST   | `/session/renew`             | Refresh access token (interceptor) |
| POST   | `/session/get-friend-status` | Check if friend is online          |

Socket events (not HTTP):

- `user:register`, `connection:request`, `connection:incoming`
- `connection:response`, `offer`, `answer`, `ice-candidate`

---

## 12. Build & Run Commands

```bash
npm run dev      # Vite dev server (port 3007)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
```

---

## 13. Deployment

Configured for Vercel (`vercel.json`): all routes rewrite to `index.html` for SPA routing.
