const MAP: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  maintenance: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  archived: "bg-neutral-500/15 text-neutral-400 border-neutral-500/30",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status] ?? MAP.archived;
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md border capitalize ${cls}`}>
      {status}
    </span>
  );
}
