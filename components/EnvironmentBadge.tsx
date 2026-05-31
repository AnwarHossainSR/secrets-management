const MAP: Record<string, string> = {
  production: "bg-red-500/15 text-red-300 border-red-500/30",
  staging: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  development: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  other: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
};

export function EnvironmentBadge({ env }: { env: string }) {
  const cls = MAP[env] ?? MAP.other;
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md border capitalize ${cls}`}>
      {env}
    </span>
  );
}
