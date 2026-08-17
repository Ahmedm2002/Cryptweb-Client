import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

export function useRecentTransfers(limit = 10) {
  const [transfers, setTransfers] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(
    async (page) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(
          `/file-transfers/recent?page=${page}&limit=${limit}`,
        );
        setTransfers(res.data?.transfers || []);
        setPageNo(res.data?.pageNo ?? page);
        setTotalPages(res.data?.totalPages ?? 0);
      } catch (err) {
        setError(err.message || "Failed to load recent transfers");
      } finally {
        setLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    fetchPage(pageNo);
  }, [pageNo, fetchPage]);

  const setPage = useCallback((page) => {
    setPageNo(page);
  }, []);

  const nextPage = useCallback(() => {
    setPageNo((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPageNo((p) => Math.max(p - 1, 1));
  }, []);

  return {
    transfers,
    pageNo,
    totalPages,
    loading,
    error,
    setPage,
    nextPage,
    prevPage,
    hasNextPage: pageNo < totalPages,
    hasPrevPage: pageNo > 1,
  };
}
