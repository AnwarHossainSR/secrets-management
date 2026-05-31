"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Hit = { _id: string; title: string; type: string; clientName?: string };

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) {
        setHits([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const j = await res.json();
      setHits(j.entries ?? []);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search entries, fields, tagsâ€¦"
        className="w-full bg-[#11141c] border vk-border rounded-lg px-3 py-2"
      />
      <div className="vk-card rounded-xl divide-y divide-[#232a3a]">
        {hits.length === 0 && q && (
          <p className="text-sm text-neutral-500 p-4 text-center">No matches</p>
        )}
        {hits.map((h) => (
          <Link key={h._id} href={`/dashboard/entries/${h._id}`} className="block px-4 py-3 hover:bg-white/5">
            <div className="text-sm">{h.title}</div>
            <div className="text-xs text-neutral-500">
              {h.clientName} Ã‚· {h.type}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
