import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  Icon,
  hint,
}: {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="vk-card rounded-xl p-4 flex items-start gap-3">
      <div
        className="size-10 rounded-lg grid place-items-center"
        style={{ background: "rgba(245,158,11,0.1)", color: "var(--amber)" }}
      >
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs vk-muted">{label}</p>
        <p className="text-2xl font-semibold vk-text mt-0.5">{value}</p>
        {hint && <p className="text-xs vk-faint mt-1">{hint}</p>}
      </div>
    </div>
  );
}
