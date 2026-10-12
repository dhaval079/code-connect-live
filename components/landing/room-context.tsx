"use client";

import { createContext, useContext, type ReactNode } from "react";

interface RoomContextValue {
  startRoom: () => void;
}

const RoomContext = createContext<RoomContextValue>({ startRoom: () => {} });

export function useRoom() {
  return useContext(RoomContext);
}

export function RoomProvider({ children }: { children: ReactNode }) {
  const startRoom = () => {
    window.location.assign("https://app.codeconnectai.tech");
  };

  return (
    <RoomContext.Provider value={{ startRoom }}>
      {children}
    </RoomContext.Provider>
  );
}
