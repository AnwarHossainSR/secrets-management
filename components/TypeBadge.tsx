import { Server, Mail, Key, Database, Rocket, StickyNote, Box } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const MAP: Record<string, { label: string; icon: LucideIcon; cls: string }> = {
  server:     { label: "Server",  icon: Server,     cls: "vk-badge vk-badge-server" },
  email:      { label: "Email",   icon: Mail,       cls: "vk-badge vk-badge-email" },
  api:        { label: "API",     icon: Key,        cls: "vk-badge vk-badge-api" },
  database:   { label: "DB",      icon: Database,   cls: "vk-badge vk-badge-db" },
  deployment: { label: "Deploy",  icon: Rocket,     cls: "vk-badge vk-badge-deploy" },
  note:       { label: "Note",    icon: StickyNote, cls: "vk-badge vk-badge-note" },
  other:      { label: "Other",   icon: Box,        cls: "vk-badge vk-badge-note" },
};

export function TypeBadge({ type }: { type: string }) {
  const m = MAP[type] ?? MAP.other;
  const Icon = m.icon;
  return (
    <span className={m.cls}>
      <Icon className="size-3" />
      {m.label}
    </span>
  );
}
