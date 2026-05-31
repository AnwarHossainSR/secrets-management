"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  KeyRound,
  Users,
  FolderKanban,
  Tag,
  Trash2,
  Settings,
  History,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/entries", label: "All Entries", icon: KeyRound },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tags", label: "Tags", icon: Tag },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/trash", label: "Trash", icon: Trash2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ clients }: { clients: { _id: string; name: string; slug: string; color: string }[] }) {
  const path = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 vk-sidebar border-r vk-border h-screen sticky top-0">
      <div className="p-5 border-b vk-border flex items-center gap-3">
        <div className="size-9 rounded-lg vk-accent-bg grid place-items-center">
          <KeyRound className="size-5" />
        </div>
        <div>
          <p className="font-semibold leading-tight vk-text">VaultKit</p>
          <p className="text-xs vk-muted">Secrets Manager</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <Link
          href="/dashboard/entries/new"
          className="flex items-center justify-center gap-2 vk-accent-bg rounded-md px-3 py-2 text-sm font-medium mb-3"
        >
          <Plus className="size-4" /> New Entry
        </Link>
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = path === n.href || (n.href !== "/dashboard" && path.startsWith(n.href));
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition",
                active ? "vk-nav-active" : "hover:bg-[var(--card-inner)]"
              )}
              style={!active ? { color: "var(--text-muted)" } : { color: "var(--text)" }}
            >
              <Icon className="size-4" />
              {n.label}
              {active && <span className="vk-nav-active-dot ml-auto" />}
            </Link>
          );
        })}

        {clients.length > 0 && (
          <div className="pt-5">
            <p className="px-3 text-[10px] uppercase tracking-wider vk-faint mb-2">Workspace</p>
            <div className="space-y-0.5">
              {clients.slice(0, 12).map((c) => (
                <Link
                  key={c._id}
                  href={`/dashboard/clients/${c._id}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-[var(--card-inner)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <span className="size-2 rounded-full" style={{ background: c.color }} />
                  <span className="truncate">{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
