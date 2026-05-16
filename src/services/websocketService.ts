import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { wsBaseUrl } from "@/lib/env";
import { useLocationsStore } from "@/store/locationsStore";
import { useAlertsStore } from "@/store/alertsStore";
import { useSocketStore } from "@/store/socketStore";
import { isVehicleDisconnectPayload } from "@/types/websocket";

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(`${wsBaseUrl}/tracking`, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15_000,
      reconnectionAttempts: Infinity,
      autoConnect: false,
    });

    const sk = socket;

    sk.on("connect", () => {
      useSocketStore.getState().setConnected(true);
      useSocketStore.getState().setReconnecting(false);
      useSocketStore.getState().setLastError(null);
      useSocketStore.getState().setTransport(sk.io.engine?.transport?.name ?? "unknown");
    });

    sk.on("disconnect", (reason) => {
      useSocketStore.getState().setConnected(false);
      useSocketStore.getState().setLastError(reason);
    });

    sk.io.on("reconnect_attempt", () => {
      useSocketStore.getState().setReconnecting(true);
    });

    sk.io.on("reconnect", () => {
      useSocketStore.getState().setReconnecting(false);
    });

    sk.io.on("reconnect_error", (err: Error) => {
      useSocketStore.getState().setLastError(err.message);
    });

    sk.on("connect_error", (err: unknown) => {
      useSocketStore.getState().setLastError(err instanceof Error ? err.message : String(err));
    });

    sk.on("vehicleLocation", (payload: unknown) => {
      useSocketStore.getState().touchEvent();
      useLocationsStore.getState().applyLocation(payload);
    });

    sk.on("vehicleAlert", (payload: unknown) => {
      useSocketStore.getState().touchEvent();
      useAlertsStore.getState().pushFromSocket(payload);
      const p = payload as { type?: string; message?: string };
      toast.warning(p.message ?? "Nueva alerta", {
        description: p.type ? `Tipo: ${p.type}` : undefined,
      });
    });

    sk.on("vehicleDisconnected", (payload: unknown) => {
      useSocketStore.getState().touchEvent();
      if (isVehicleDisconnectPayload(payload)) {
        useLocationsStore.getState().markVehicleOffline(payload.vehicleId);
        toast.message("Vehículo desconectado", {
          description: payload.vehicleId.slice(0, 8) + "…",
        });
      }
    });

    sk.on("vehicleConnected", () => {
      useSocketStore.getState().touchEvent();
    });
  }
  return socket;
}

export const websocketService = {
  connect() {
    const s = getSocket();
    if (!s.connected) s.connect();
  },

  disconnect() {
    if (socket?.connected) socket.disconnect();
    useSocketStore.getState().setConnected(false);
  },

  destroy() {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
      socket = null;
    }
  },
};
