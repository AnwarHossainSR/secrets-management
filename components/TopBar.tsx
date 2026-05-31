"use client";

import Link from "next/link";
import { Bell, History, LogOut, Search } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { SearchModal } from "./SearchModal";

export function TopBar({ userName }: { userName?: string | null }) {
  const [openSearch, setOpenSearch] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-10 vk-topbar border-b vk-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setOpenSearch(true)}
          className="flex-1 max-w-md flex items-center gap-2 vk-search rounded-md px-3 py-2 text-sm vk-faint hover:border-[var(--border-hover)]"
          style={{ color: "var(--text-faint)" }}
        >
          <Search className="size-4" />
          Search vaults...
          <span
            className="ml-auto text-[10px] rounded px-1.5 py-0.5"
            style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            Ctrl K
          </span>
        </button>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/dashboard/history" className="p-2 rounded-md hover:bg-[var(--card-inner)] vk-muted" title="History">
            <History className="size-4" />
          </Link>
          <button className="p-2 rounded-md hover:bg-[var(--card-inner)] vk-muted" title="Notifications">
            <Bell className="size-4" />
          </button>
          <div className="flex items-center gap-2 pl-2 border-l vk-border">
            <span className="text-sm vk-text hidden sm:block">{userName ?? "User"}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-md hover:bg-[var(--card-inner)] vk-muted"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <SearchModal open={openSearch} onClose={() => setOpenSearch(false)} />
    </header>
  );
}
