"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useToast, type ToastKind } from "@/hooks/use-toast";
import { ToastNotification } from "@/components/ui/toast";

interface RoomContextValue {
  startRoom: () => void;
}

const RoomContext = createContext<RoomContextValue>({ startRoom: () => {} });

export function useRoom() {
  return useContext(RoomContext);
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const { toast, show } = useToast();

  const startRoom = () => {
    const id = "cc-" + Math.random().toString(36).slice(2, 8);
    show(`Spun up room · ${id}`, "success");
  };

  return (
    <RoomContext.Provider value={{ startRoom }}>
      {children}
      <ToastNotification toast={toast} />
    </RoomContext.Provider>
  );
}
