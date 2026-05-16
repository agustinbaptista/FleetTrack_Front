import { create } from "zustand";

type SocketState = {
  connected: boolean;
  reconnecting: boolean;
  lastError: string | null;
  lastEventAt: string | null;
  transport: string | null;
  setConnected: (v: boolean) => void;
  setReconnecting: (v: boolean) => void;
  setLastError: (msg: string | null) => void;
  touchEvent: () => void;
  setTransport: (t: string | null) => void;
};

export const useSocketStore = create<SocketState>((set) => ({
  connected: false,
  reconnecting: false,
  lastError: null,
  lastEventAt: null,
  transport: null,

  setConnected: (v) => set({ connected: v }),
  setReconnecting: (v) => set({ reconnecting: v }),
  setLastError: (msg) => set({ lastError: msg }),
  touchEvent: () => set({ lastEventAt: new Date().toISOString() }),
  setTransport: (t) => set({ transport: t }),
}));
