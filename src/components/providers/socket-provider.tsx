"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { websocketService } from "@/services/websocketService";

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (user) websocketService.connect();
    else websocketService.disconnect();
  }, [user, hydrated]);

  return <>{children}</>;
}
