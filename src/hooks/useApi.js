import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useApi = (endpointOrFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setData(null);
      
      try {
        let response;
        if (typeof endpointOrFunction === 'function') {
          response = await endpointOrFunction();
        } else {
          response = await api.get(endpointOrFunction);
        }
        
        if (isMounted) {
          if (typeof response === "string") {
             setError(response);
          } else if (response && response.success !== false) {
             setData(response.data || response.user || response);
          } else {
             setError(response?.message || response?.errors || "Unknown error");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.message || 
            "An error occurred"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, dependencies);

  return [data, loading, error];
};
