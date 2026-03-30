import { useEffect, useRef, useCallback } from "react";

export const useApi = () => {
  const activeRequests = useRef(new Set());

  const trackRequest = useCallback(({ promise, abort }) => {
    activeRequests.current.add(abort);

    // Remove from tracked set when the request settles
    const cleanup = () => activeRequests.current.delete(abort);
    promise.then(cleanup).catch(cleanup);

    return promise;
  }, []);

  useEffect(() => {
    // Cleanup active requests dynamically on component unmount
    return () => {
      activeRequests.current.forEach((abort) => abort());
      activeRequests.current.clear();
    };
  }, []);

  return { trackRequest };
};
