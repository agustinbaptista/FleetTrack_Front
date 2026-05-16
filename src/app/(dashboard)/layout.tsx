"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AuthHydrate } from "@/components/auth/auth-hydrate";
import { SocketProvider } from "@/components/providers/socket-provider";

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthHydrate>
      <SocketProvider>
        <AppShell>{children}</AppShell>
      </SocketProvider>
    </AuthHydrate>
  );
}
