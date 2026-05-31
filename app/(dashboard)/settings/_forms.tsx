"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function SettingsForms({ userName, userEmail }: { userName: string; userEmail: string }) {
  const [name, setName] = useState(userName);
  const [password, setPassword] = useState("");
  const [importing, setImporting] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password: password || undefined }),
    });
    if (!res.ok) toast.error("Failed");
    else {
      toast.success("Saved");
      setPassword("");
    }
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const text = await file.text();
    const res = await fetch("/api/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: text,
    });
    setImporting(false);
    if (!res.ok) {
      toast.error("Import failed");
      return;
    }
    const j = await res.json();
    toast.success(`Imported ${j.imported} entries`);
  };

  const wipe = async () => {
    if (!confirm("Wipe ALL your data? Cannot be undone.")) return;
    const res = await fetch("/api/me/wipe", { method: "POST" });
    if (res.ok) toast.success("Wiped");
    else toast.error("Failed");
  };

  return (
    <div className="space-y-8">
      <section className="vk-card rounded-xl p-5">
        <h2 className="font-medium mb-3">Profile</h2>
        <form onSubmit={saveProfile} className="space-y-3">
          <label className="block">
            <span className="text-sm">Email</span>
            <input
              value={userEmail}
              disabled
              className="mt-1 w-full bg-[#11141c] border vk-border rounded-lg px-3 py-2 opacity-70"
            />
          </label>
          <label className="block">
            <span className="text-sm">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-[#11141c] border vk-border rounded-lg px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm">New password (leave blank to keep)</span>
            <input
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full bg-[#11141c] border vk-border rounded-lg px-3 py-2"
            />
          </label>
          <button className="vk-accent-bg rounded-lg px-4 py-2 font-medium">Save</button>
        </form>
      </section>

      <section className="vk-card rounded-xl p-5 space-y-3">
        <h2 className="font-medium">Backup</h2>
        <form action="/api/export" method="POST">
          <button className="border vk-border rounded-lg px-3 py-2 text-sm hover:bg-white/5">
            Export encrypted JSON
          </button>
        </form>
        <label className="block">
          <span className="text-sm block mb-1">Import encrypted JSON</span>
          <input type="file" accept="application/json" onChange={onImport} disabled={importing} />
        </label>
      </section>

      <section className="vk-card rounded-xl p-5 border-red-500/30">
        <h2 className="font-medium text-red-400">Danger zone</h2>
        <p className="text-sm text-neutral-400 mt-1 mb-3">Wipe all entries, clients, projects, and activity.</p>
        <button onClick={wipe} className="bg-red-500/20 text-red-300 rounded-lg px-4 py-2 text-sm">
          Wipe all data
        </button>
      </section>
    </div>
  );
}
