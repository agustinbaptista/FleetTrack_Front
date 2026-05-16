"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map as MapIcon,
  Truck,
  Bell,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Mapa en vivo", icon: MapIcon },
  { href: "/vehicles", label: "Vehículos", icon: Truck },
  { href: "/alerts", label: "Alertas", icon: Bell },
];

export function Sidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen?.(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col border-r border-slate-200 bg-slate-950 text-slate-100 transition-all duration-300 ease-in-out dark:border-slate-800 md:static md:translate-x-0",
          collapsed ? "md:w-[72px] w-56" : "w-56",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-3">
          <div className={cn("flex flex-col leading-tight", collapsed && "md:hidden")}>
            <span className="text-sm font-semibold tracking-tight">FleetTrack</span>
            <span className="text-[10px] uppercase text-slate-500">GPS & logística</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto hidden text-slate-300 hover:bg-slate-800 hover:text-white md:flex"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto flex text-slate-300 hover:bg-slate-800 hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen?.(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                onClick={() => setMobileMenuOpen?.(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sky-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  collapsed && "md:justify-center md:px-0",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={cn(collapsed && "md:hidden")}>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
