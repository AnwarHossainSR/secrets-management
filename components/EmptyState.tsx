import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  Icon,
  title,
  description,
  cta,
}: {
  Icon: LucideIcon;
  title: string;
  description?: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="vk-card rounded-xl p-10 text-center">
      <div
        className="size-12 rounded-lg mx-auto grid place-items-center mb-4"
        style={{ background: "var(--card-inner)", color: "var(--text-muted)" }}
      >
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-medium vk-text">{title}</h3>
      {description && <p className="text-sm vk-muted mt-1 max-w-md mx-auto">{description}</p>}
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1.5 mt-5 vk-accent-bg rounded-md px-4 py-2 text-sm font-medium"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
