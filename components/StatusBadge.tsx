const MAP: Record<string, string> = {
  active:      "vk-badge vk-badge-active",
  maintenance: "vk-badge vk-badge-maint",
  archived:    "vk-badge vk-badge-arch",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = MAP[status] ?? MAP.archived;
  return <span className={cls}>{status}</span>;
}
