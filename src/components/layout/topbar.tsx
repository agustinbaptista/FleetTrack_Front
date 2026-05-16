"use client";

import { Moon, Sun, LogOut, User, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Topbar({ setMobileMenuOpen }: { setMobileMenuOpen: (open: boolean) => void }) {
  const { setTheme, resolvedTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const dark = resolvedTheme === "dark";

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="md:hidden px-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menú</span>
      </Button>
      <div className="flex flex-1 items-center gap-3">
        <span className="hidden text-sm text-slate-500 sm:inline">Panel de monitoreo en tiempo real</span>
      </div>
      <div className="flex items-center gap-2">
        {user?.role && <Badge variant="muted">{user.role}</Badge>}
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300 sm:flex">
          <User className="h-3.5 w-3.5" />
          <span className="max-w-[180px] truncate">{user?.email}</span>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => setTheme(dark ? "light" : "dark")}
          aria-label="Alternar tema"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-rose-600" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Salir</span>
        </Button>
      </div>
    </header>
  );
}
