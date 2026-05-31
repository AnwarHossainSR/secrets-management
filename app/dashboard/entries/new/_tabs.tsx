"use client";

import { useState } from "react";
import { Pencil, Upload } from "lucide-react";
import { EntryForm } from "../_form";
import { ImportEnvForm } from "./_import-env";

type Client = { _id: string; name: string };
type Project = { _id: string; name: string; client: string };

export function NewEntryTabs({ clients, projects }: { clients: Client[]; projects: Project[] }) {
  const [tab, setTab] = useState<"manual" | "env">("manual");

  return (
    <div>
      <div className="flex items-center gap-1 mb-5 p-1 rounded-md inline-flex vk-card-inner">
        <button
          onClick={() => setTab("manual")}
          className={`px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1.5 ${
            tab === "manual" ? "vk-accent-bg" : "vk-muted hover:bg-[var(--border)]"
          }`}
        >
          <Pencil className="size-3.5" /> Manual entry
        </button>
        <button
          onClick={() => setTab("env")}
          className={`px-3 py-1.5 text-sm rounded-md inline-flex items-center gap-1.5 ${
            tab === "env" ? "vk-accent-bg" : "vk-muted hover:bg-[var(--border)]"
          }`}
        >
          <Upload className="size-3.5" /> Import .env
        </button>
      </div>

      {tab === "manual" ? (
        <EntryForm clients={clients} projects={projects} />
      ) : (
        <ImportEnvForm clients={clients} projects={projects} />
      )}
    </div>
  );
}
