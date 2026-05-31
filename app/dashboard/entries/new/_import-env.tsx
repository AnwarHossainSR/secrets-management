"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Upload, FileCode2 } from "lucide-react";

type Client = { _id: string; name: string };
type Project = { _id: string; name: string; client: string };

const ENVS = ["production", "staging", "development", "other"] as const;

function previewPairs(text: string) {
  const lines = text.split(/\r?\n/);
  let count = 0;
  const sample: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (!/^(?:export\s+)?[A-Za-z_][A-Za-z0-9_]*\s*=/.test(line)) continue;
    count++;
    if (sample.length < 5) sample.push(line.split("=")[0].replace(/^export\s+/, ""));
  }
  return { count, sample };
}

export function ImportEnvForm({ clients, projects }: { clients: Client[]; projects: Project[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [client, setClient] = useState(clients[0]?._id ?? "");
  const [project, setProject] = useState("");
  const [environment, setEnvironment] = useState<(typeof ENVS)[number]>("production");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const projOptions = useMemo(() => projects.filter((p) => p.client === client), [projects, client]);
  const preview = useMemo(() => previewPairs(content), [content]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContent(text);
    if (!title) setTitle(file.name.replace(/\.env(\..+)?$/, "") || "Imported .env");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (preview.count === 0) {
      toast.error("No KEY=VALUE pairs detected");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/entries/import-env", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        client,
        project: project || null,
        environment,
        content,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Import failed");
      return;
    }
    const j = await res.json();
    toast.success(`Imported ${j.count} secrets, encrypted`);
    router.push(`/dashboard/entries/${j.id}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="vk-card rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm vk-muted">Entry title</span>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Production API keys"
              className="mt-1 w-full rounded-md px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm vk-muted">Environment</span>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as (typeof ENVS)[number])}
              className="mt-1 w-full rounded-md px-3 py-2 capitalize"
            >
              {ENVS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm vk-muted">Client</span>
            <select
              required
              value={client}
              onChange={(e) => { setClient(e.target.value); setProject(""); }}
              className="mt-1 w-full rounded-md px-3 py-2"
            >
              <option value="">Select…</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm vk-muted">Project (optional)</span>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="mt-1 w-full rounded-md px-3 py-2"
            >
              <option value="">None</option>
              {projOptions.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="vk-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium vk-text">Paste or upload your <code className="vk-mono">.env</code></p>
            <p className="text-xs vk-muted mt-0.5">
              Each KEY=VALUE pair becomes an encrypted field. Comments and blank lines are ignored.
            </p>
          </div>
          <label className="inline-flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5 vk-accent cursor-pointer hover:bg-[var(--card-inner)]" style={{ border: "1px solid var(--border)" }}>
            <Upload className="size-3.5" />
            Upload file
            <input type="file" accept=".env,text/plain" hidden onChange={onFile} />
          </label>
        </div>
        <textarea
          rows={14}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          placeholder={`# Paste contents of .env\nDATABASE_URL=postgres://...\nSTRIPE_SECRET=sk_live_...\nAUTH_SECRET="abc 123"`}
          className="w-full rounded-md px-3 py-2 vk-mono text-sm"
        />
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="inline-flex items-center gap-1.5 vk-muted">
            <FileCode2 className="size-3.5" />
            {preview.count} pair{preview.count === 1 ? "" : "s"} detected
            {preview.sample.length > 0 && (
              <span className="vk-faint">
                {" · "}
                {preview.sample.join(", ")}
                {preview.count > preview.sample.length ? "…" : ""}
              </span>
            )}
          </span>
          <span className="vk-faint">AES-256 encrypted on save</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || preview.count === 0}
        className="vk-accent-bg rounded-md px-4 py-2 font-medium disabled:opacity-50"
      >
        {saving ? "Encrypting…" : `Import ${preview.count || ""} secret${preview.count === 1 ? "" : "s"}`}
      </button>
    </form>
  );
}
