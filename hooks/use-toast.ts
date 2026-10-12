"use client";

import { useState, useCallback } from "react";

export type ToastKind = "success" | "error" | "info";

export interface Toast {
  msg: string;
  kind?: ToastKind;
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null);

  const show = useCallback((msg: string, kind: ToastKind = "info") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2800);
  }, []);

  return { toast, show };
}
