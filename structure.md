# React Components Structure & Documentation

This document provides an in-depth breakdown of the `src/components` directory. It explains the purpose, layout, and main functions of each file and subdirectory within the components folder.

## Root Components (`src/components/`)

### `AudioCall.jsx`
- **Purpose**: A placeholder UI component for an upcoming peer-to-peer audio communication feature.
- **Main Functions/Features**: Renders a visually appealing layout indicating that the "Audio Call" feature is in development.

### `Banner.jsx`
- **Purpose**: A reusable UI banner component used to display alerts or important messages.
- **Main Functions/Features**: Accepts `text`, `buttonText`, and `onClick` props. It conditionally renders a button if an action is provided.

### `Button.jsx`
- **Purpose**: A highly reusable, stylized button component used across the application.
- **Main Functions/Features**: Supports different variants (`primary`, `secondary`) via props, and passes through standard HTML button attributes like `disabled`, `type`, and `onClick`.

### `EmailInput.jsx`
- **Purpose**: A form component that allows the user to input their friend's email address to initiate a peer-to-peer connection.
- **Main Functions/Features**: Maintains the email state, provides a visually distinct user active status, and triggers the `onConnect` callback when the user submits a valid email.

### `FileTransfer.jsx`
- **Purpose**: The core container component orchestrating the peer-to-peer file transfer feature.
- **Main Functions/Features**: 
  - Manages the entire lifecycle of file transfer leveraging the `useFileTransfer` hook.
  - Conditionally renders inner components: `FileTransferIncoming` (for received files), `FileTransferProgress` (during active transfer), and `FileTransferDropzone` (for selecting files).
  - Handles the action to initiate the transfer (`sendSecuredFile`).

### `Loader.jsx`
- **Purpose**: A simple UI component displaying a loading animation (spinner).
- **Main Functions/Features**: Provides visual feedback during asynchronous operations.

### `Navbar.jsx`
- **Purpose**: The main public-facing navigation bar for the application.
- **Main Functions/Features**: Includes responsive navigation links, a prominent "Get Started" call-to-action button, and a mobile-friendly hamburger menu with smooth drop-down transitions.

### `Popup.jsx`
- **Purpose**: A generic, reusable modal overlay component.
- **Main Functions/Features**: 
  - Handles click-outside-to-close behavior and "Escape" key listeners.
  - Manages enter/exit CSS transitions for a smooth appearance/disappearance.

### `ServicesPicker.jsx`
- **Purpose**: An interactive menu component allowing the user to pick which peer-to-peer service they want to use once connected to a friend.
- **Main Functions/Features**: Displays cards for "Audio Call", "Send File", and "Video Call". Handles disabled states and "Upcoming" badges for unimplemented features.

### `StatusBar.jsx`
- **Purpose**: A small UI widget indicating the current connection status with a friend.
- **Main Functions/Features**: Displays if the friend is currently online or offline, complete with an animated pulsing indicator.

### `VideoCall.jsx`
- **Purpose**: A placeholder UI component for an upcoming peer-to-peer video streaming feature.
- **Main Functions/Features**: Similar to `AudioCall.jsx`, it renders a polished "In Development" interface.

---

## Configuration (`src/components/configs/`)

### `webrtc.config.js`
- **Purpose**: The core logic and configuration file for establishing WebRTC peer-to-peer connections.
- **Main Functions/Features**:
  - Initializes `RTCPeerConnection` with Google's STUN servers.
  - Handles ICE candidate generation and state changes.
  - Manages WebRTC Data Channels specifically optimized for file transfer (`createDataChannel`, `setupDataChannel`).
  - Exports functions for creating SDP offers and answers (`createOffer`, `createAnswer`).

---

## Dashboard Components (`src/components/dashboard/`)

### `VerificationBanner.jsx`
- **Purpose**: A banner specific to the dashboard that warns users if their account email has not yet been verified.
- **Main Functions/Features**: Displays an alert and provides a direct navigation link to the verification page.

### `ConnectionStatus/` Subdirectory
Contains individual UI components representing the various states of a peer-to-peer connection lifecycle.

- **`AcceptedStatus.jsx`**: The main interface shown when a connection is successful. It renders the `StatusBar`, allows users to disconnect, and manages the view of the currently active service (`ServicesPicker`, `FileTransfer`, `AudioCall`, etc.).
- **`DeclinedStatus.jsx`**: Displays a message when a peer declines a connection request.
- **`IncomingRequest.jsx`**: A modal overlay prompting the current user to accept or decline an incoming connection request from another user.
- **`OfflineStatus.jsx`**: Displays a message indicating that the requested friend is not currently online.
- **`PendingStatus.jsx`**: A waiting screen displayed to the sender while waiting for the receiver to accept the connection.
- **`TimeoutStatus.jsx`**: Shown when a connection request expires without a response.

---

## File Transfer Subcomponents (`src/components/file-transfer/`)

### `FileTransferDropzone.jsx`
- **Purpose**: The interactive area where users can drag-and-drop or browse to select files they want to send.
- **Main Functions/Features**: Handles standard drag-and-drop DOM events, file input parsing, and provides visual feedback (file name, size) for the selected file before sending.

### `FileTransferIncoming.jsx`
- **Purpose**: A component rendered when a file has been completely and successfully received from a peer.
- **Main Functions/Features**: Displays the received file's name and size, and provides a "Download" button to save it locally.

### `FileTransferProgress.jsx`
- **Purpose**: An indicator shown during an active file transmission (sending or receiving).
- **Main Functions/Features**: Renders a dynamic, animated circular SVG progress bar alongside real-time metrics like transfer speed (MB/s).

---

## Layout Components (`src/components/layout/`)

### `DashboardLayout.jsx`
- **Purpose**: The overarching wrapper for authenticated views.
- **Main Functions/Features**: Orchestrates the placement of the `Header`, `Sidebar`, and main content area. It also manages a global "Logout Confirmation" modal.

### `Header.jsx`
- **Purpose**: The top navigation bar exclusively for the dashboard/authenticated layout.
- **Main Functions/Features**: Includes a mobile menu toggle, app branding, and a user profile avatar.

### `Sidebar.jsx`
- **Purpose**: The side navigation menu for the dashboard.
- **Main Functions/Features**: Contains navigation links (`Home`, etc.), responsive mobile handling, and a dedicated logout button.

---

## Profile Components (`src/components/profile/`)

### `Profile.jsx`
- **Purpose**: The main view displaying a user's personal profile information.
- **Main Functions/Features**: Shows user details (name, email), a verification status badge, and renders the `SessionList` component below it.

### `SessionList.jsx`
- **Purpose**: A component that fetches and displays all active login sessions associated with the user's account.
- **Main Functions/Features**: Makes an API call to `/user-session/all`, handles loading/error states, and renders cards showing device types, OS, browser, and start time for each active session.

---

## Settings Components (`src/components/settings/`)

### `Settings.jsx`
- **Purpose**: A placeholder view for the application settings page.
- **Main Functions/Features**: Currently displays a simple "coming soon" message.

---

## Generic UI Components (`src/components/ui/`)

### `Input.jsx`
- **Purpose**: A reusable, stylized text input field component.
- **Main Functions/Features**: Associates an optional `label` with an `input` element and applies consistent focus and styling states.

### `Modal.jsx`
- **Purpose**: A higher-order modal component built on top of `Popup.jsx`.
- **Main Functions/Features**: Standardizes modal structure by automatically including a styled `title` header before the children content.

### `Tabs.jsx`
- **Purpose**: A generic tabbed navigation component for switching between different views in the same container.
- **Main Functions/Features**: Manages active tab state and renders a row of clickable tab buttons corresponding to the active content.
