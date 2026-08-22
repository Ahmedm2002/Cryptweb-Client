import { useCallback, useMemo } from "react";

/**
 * Thin access layer over the active RTCPeer's data channel.
 * Implemented as a hook so ref arguments are only read from within
 * stable callbacks (never during render).
 */
export function useDataChannelApi(
  peerRef,
  dataChannelCallbackRef,
  routeIncomingData,
) {
  const subscribeToDataChannel = useCallback(
    (callback) => {
      dataChannelCallbackRef.current = callback;
      if (peerRef.current) {
        peerRef.current._onDataChannelMessage = routeIncomingData;
      }
    },
    [dataChannelCallbackRef, peerRef, routeIncomingData],
  );

  const isDataChannelOpen = useCallback(
    () => peerRef.current?.isDataChannelOpen() ?? false,
    [peerRef],
  );

  const getDataChannel = useCallback(
    () => peerRef.current?.getDataChannel() ?? null,
    [peerRef],
  );

  const getMaxMessageSize = useCallback(
    () => peerRef.current?.getMaxMessageSize() ?? 65536,
    [peerRef],
  );

  const sendDataViaWebRTC = useCallback(
    (data, options) => {
      if (peerRef.current) {
        return peerRef.current.sendData(data, options);
      }
      return Promise.reject(new Error("No peer connection"));
    },
    [peerRef],
  );

  return useMemo(
    () => ({
      subscribeToDataChannel,
      isDataChannelOpen,
      getDataChannel,
      getMaxMessageSize,
      sendDataViaWebRTC,
    }),
    [
      subscribeToDataChannel,
      isDataChannelOpen,
      getDataChannel,
      getMaxMessageSize,
      sendDataViaWebRTC,
    ],
  );
}
