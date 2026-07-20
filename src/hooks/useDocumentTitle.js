import { useEffect } from "react";

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — Cryptweb` : "Cryptweb — Direct Secure File Transfers";
    return () => {
      document.title = prev;
    };
  }, [title]);
};
