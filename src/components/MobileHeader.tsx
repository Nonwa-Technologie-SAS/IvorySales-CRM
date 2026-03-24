"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { sidebarItems } from "./Sidebar";

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-white/60 bg-linear-to-r from-[#f7f7fb] via-white to-[#eef1ff] shadow-neu-soft/70">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-neu hover:shadow-neu-soft transition-shadow"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white shadow-neu">
            K
          </span>
          <span className="text-[11px] font-medium text-gray-700">
            KpiTracker Mobile
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-neu hover:text-primary"
            aria-label="Recherche"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-neu hover:text-primary"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-semibold text-white shadow">
              2
            </span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 shadow-neu hover:shadow-neu-soft"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-indigo-500 text-[10px] font-semibold text-white">
              M
            </div>
            <ChevronDown className="h-3 w-3 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] text-gray-500 shadow-neu flex-1"
          onClick={() => router.push("/leads")}
        >
          <Search className="h-3.5 w-3.5 text-gray-400" />
          <span className="truncate">Rechercher un client, un lead…</span>
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-neu"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      <nav className="px-2 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {sidebarItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] shadow-neu transition-colors ${
                isActive
                  ? "border-primary/70 bg-primary text-white"
                  : "border-white/80 bg-white text-gray-600 hover:text-primary"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}

