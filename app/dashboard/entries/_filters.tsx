"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TYPES = ["server", "email", "api", "database", "deployment", "note", "other"];
const ENVS = ["production", "staging", "development", "other"];
const SORTS = [
  { v: "newest", l: "Newest" },
  { v: "oldest", l: "Oldest" },
  { v: "viewed", l: "Last viewed" },
  { v: "name", l: "Name" },
];

export function EntriesFilters({
  clients,
  initial,
}: {
  clients: { _id: string; name: string; slug: string }[];
  initial: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`?${next.toString()}`);
  };

  return (
    <div className="vk-card rounded-xl p-3 flex flex-wrap gap-2 items-center">
      <input
        defaultValue={initial.q ?? ""}
        placeholder="Search titleâ€¦"
        onKeyDown={(e) => {
          if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
        }}
        className="flex-1 min-w-40 bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5 text-sm"
      />
      <select
        defaultValue={initial.client ?? ""}
        onChange={(e) => update("client", e.target.value)}
        className="bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All clients</option>
        {clients.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={initial.type ?? ""}
        onChange={(e) => update("type", e.target.value)}
        className="bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        defaultValue={initial.environment ?? ""}
        onChange={(e) => update("environment", e.target.value)}
        className="bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5 text-sm"
      >
        <option value="">All envs</option>
        {ENVS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        defaultValue={initial.sort ?? "newest"}
        onChange={(e) => update("sort", e.target.value)}
        className="bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5 text-sm"
      >
        {SORTS.map((s) => (
          <option key={s.v} value={s.v}>
            {s.l}
          </option>
        ))}
      </select>
    </div>
  );
}
