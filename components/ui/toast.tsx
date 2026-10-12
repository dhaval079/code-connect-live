"use client";

import { type Toast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";

interface ToastProps {
  toast: Toast | null;
}

export function ToastNotification({ toast }: ToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.msg}
          initial={{ opacity: 0, y: 12, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 8, x: "-50%" }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 left-1/2 z-[100] inline-flex items-center gap-2
            rounded-full bg-ink text-paper px-4 py-[10px] shadow-3
            font-sans font-medium text-[13px]"
          style={{ translateX: "-50%" }}
        >
          <span
            className="w-[6px] h-[6px] rounded-full"
            style={{
              background:
                toast.kind === "success"
                  ? "#86efac"
                  : toast.kind === "error"
                  ? "#f87171"
                  : "#22d3ee",
            }}
          />
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
