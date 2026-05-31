"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

type Hit = { _id: string; title: string; clientName?: string; type: string };

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      if (!q.trim()) {
        setHits([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setHits(data.entries ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [q, open]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-start pt-24 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="vk-card w-full max-w-xl rounded-xl shadow-2xl border vk-border"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b vk-border">
          <Search className="size-4 text-neutral-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            placeholder="Search entries, fields, tags, clients…"
          />
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="size-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {hits.length === 0 && q && <p className="text-sm text-neutral-500 p-4 text-center">No matches</p>}
          {hits.length === 0 && !q && (
            <p className="text-xs text-neutral-500 p-4 text-center">Start typing to search…</p>
          )}
          {hits.map((h) => (
            <Link
              key={h._id}
              href={`/dashboard/entries/${h._id}`}
              onClick={onClose}
              className="block px-3 py-2 rounded-md hover:bg-white/5"
            >
              <div className="text-sm">{h.title}</div>
              <div className="text-xs text-neutral-500">
                {h.clientName} · {h.type}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
