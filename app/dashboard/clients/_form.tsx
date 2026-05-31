"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const PALETTE = ["#f59e0b", "#ef4444", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#eab308"];
const STATUSES = ["active", "maintenance", "archived"] as const;

export function ClientForm({
  initial,
}: {
  initial?: { _id: string; name: string; slug: string; color: string; status: string };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);
  const [status, setStatus] = useState(initial?.status ?? "active");
  const [saving, setSaving] = useState(false);

  const autoSlug = (n: string) =>
    n
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 4);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = initial ? `/api/clients/${initial._id}` : "/api/clients";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, color, status }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed");
      return;
    }
    toast.success(initial ? "Updated" : "Created");
    router.push("/dashboard/clients");
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-sm">Name</span>
        <input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!initial && !slug) setSlug(autoSlug(e.target.value));
          }}
          className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm">Slug (max 6)</span>
        <input
          required
          maxLength={6}
          value={slug}
          onChange={(e) => setSlug(e.target.value.toUpperCase())}
          className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2 vk-mono"
        />
      </label>
      <div>
        <p className="text-sm mb-2">Color</p>
        <div className="flex gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`size-8 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <label className="block">
        <span className="text-sm">Status</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2 capitalize"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={saving} className="vk-accent-bg rounded-lg px-4 py-2 font-medium disabled:opacity-60">
        {saving ? "Saving…" : initial ? "Update Client" : "Create Client"}
      </button>
    </form>
  );
}
