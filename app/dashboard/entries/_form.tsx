"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DynamicFieldBuilder, type FieldInput } from "@/components/DynamicFieldBuilder";
import { TagInput } from "@/components/TagInput";

const TYPES = ["server", "email", "api", "database", "deployment", "note", "other"] as const;
const ENVS = ["production", "staging", "development", "other"] as const;

export function EntryForm({
  clients,
  projects,
  initial,
}: {
  clients: { _id: string; name: string }[];
  projects: { _id: string; name: string; client: string }[];
  initial?: {
    _id: string;
    title: string;
    type: string;
    client: string;
    project?: string | null;
    fields: FieldInput[];
    tags: string[];
    isPinned: boolean;
    environment: string;
    notes: string;
  };
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<string>(initial?.type ?? "other");
  const [client, setClient] = useState(initial?.client ?? clients[0]?._id ?? "");
  const [project, setProject] = useState<string>(initial?.project ?? "");
  const [environment, setEnvironment] = useState(initial?.environment ?? "production");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [isPinned, setIsPinned] = useState(!!initial?.isPinned);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [fields, setFields] = useState<FieldInput[]>(initial?.fields ?? [{ label: "", value: "", isSecret: true }]);
  const [saving, setSaving] = useState(false);

  const clientProjects = useMemo(() => projects.filter((p) => p.client === client), [projects, client]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title,
      type,
      client,
      project: project || null,
      environment,
      tags,
      isPinned,
      notes,
      fields: fields.filter((f) => f.label),
    };
    const url = initial ? `/api/entries/${initial._id}` : "/api/entries";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Save failed");
      return;
    }
    toast.success(initial ? "Updated" : "Created");
    const j = await res.json().catch(() => ({}));
    const id = initial?._id ?? j.id;
    router.push(`/dashboard/entries/${id}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        <span className="text-sm text-neutral-300">Title</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-300">Type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-neutral-300">Environment</span>
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
          >
            {ENVS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm text-neutral-300">Client</span>
          <select
            required
            value={client}
            onChange={(e) => {
              setClient(e.target.value);
              setProject("");
            }}
            className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
          >
            <option value="">Select…</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-sm text-neutral-300">Project (optional)</span>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
          >
            <option value="">None</option>
            {clientProjects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="text-sm text-neutral-300 mb-2">Fields</p>
        <DynamicFieldBuilder value={fields} onChange={setFields} />
      </div>

      <label className="block">
        <span className="text-sm text-neutral-300">Tags</span>
        <div className="mt-1">
          <TagInput value={tags} onChange={setTags} />
        </div>
      </label>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="accent-amber-500"
        />
        <span className="text-sm">Pin to dashboard</span>
      </label>

      <label className="block">
        <span className="text-sm text-neutral-300">Notes</span>
        <textarea
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="vk-accent-bg rounded-lg px-4 py-2 font-medium disabled:opacity-60"
      >
        {saving ? "Saving…" : initial ? "Update Entry" : "Create Entry"}
      </button>
    </form>
  );
}
