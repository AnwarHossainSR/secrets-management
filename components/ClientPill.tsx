export function ClientPill({ slug, color, name }: { slug: string; color: string; name?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md border"
      style={{ borderColor: color + "55", color, background: color + "15" }}
      title={name}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {slug}
    </span>
  );
}
