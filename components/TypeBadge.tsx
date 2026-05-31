import { Server, Mail, Key, Database, Rocket, StickyNote, Box } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAP: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
  server: { label: "Server", icon: Server, cls: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
  email: { label: "Email", icon: Mail, cls: "bg-purple-500/15 text-purple-300 border-purple-500/30" },
  api: { label: "API", icon: Key, cls: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
  database: { label: "Database", icon: Database, cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  deployment: { label: "Deploy", icon: Rocket, cls: "bg-pink-500/15 text-pink-300 border-pink-500/30" },
  note: { label: "Note", icon: StickyNote, cls: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30" },
  other: { label: "Other", icon: Box, cls: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30" },
};

export function TypeBadge({ type }: { type: string }) {
  const m = MAP[type] ?? MAP.other;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md border ${m.cls}`}>
      <Icon className="size-3" />
      {m.label}
    </span>
  );
}
