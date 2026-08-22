import { useEffect } from "react";
import { SOCKET_EVENTS } from "./socket.events.js";
import { socket } from "./socket.js";

/**
 * Registers all event handlers on the shared socket with stable
 * trampolines so handler closures stay fresh across renders.
 * Also owns connect-on-mount and peer teardown on unmount.
 *
 * @param {object} params
 * @param {object} params.user           authenticated user (gates activation)
 * @param {React.MutableRefObject} params.peerRef     active RTCPeer ref
 * @param {React.MutableRefObject} params.timerRef    reconnect grace timer ref
 * @param {React.MutableRefObject} params.handlersRef { [SOCKET_EVENTS.X]: fn }
 */
export function useSocketLifecycle({ user, peerRef, timerRef, handlersRef }) {
  useEffect(() => {
    if (!user) return;

    const events = Object.keys(handlersRef.current || {});
    const trampolines = Object.fromEntries(
      events.map((evt) => [
        evt,
        (...args) => handlersRef.current?.[evt]?.(...args),
      ]),
    );
    events.forEach((evt) => socket.on(evt, trampolines[evt]));

    if (!socket.connected) {
      socket.connect();
    } else {
      handlersRef.current?.[SOCKET_EVENTS.CONNECT]?.();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      events.forEach((evt) => socket.off(evt, trampolines[evt]));
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
    };
  }, [user, peerRef, timerRef, handlersRef]);
}
