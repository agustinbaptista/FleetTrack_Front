"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getAccessToken } from "@/store/authStore";

export function AuthHydrate({ children }: { children: React.ReactNode }) {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!hydrated) return;
    const token = getAccessToken();
    if (!token || !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, user, router, pathname]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-600 dark:border-t-slate-200" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
