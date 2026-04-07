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
          response = await api(endpointOrFunction);
        }
        
        if (isMounted) {
          if (response.data.success) {
            setData(response.data.data);
          } else {
            setError(response.data.message || response.data.errors || "Unknown error");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message || 
            err.response?.data?.errors || 
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
