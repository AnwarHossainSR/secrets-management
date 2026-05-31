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
      <div className="size-10 rounded-lg bg-violet-500/10 grid place-items-center vk-accent">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="text-2xl font-semibold mt-0.5">{value}</p>
        {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
      </div>
    </div>
  );
}
