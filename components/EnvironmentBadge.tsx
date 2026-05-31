const MAP: Record<string, string> = {
  production:  "vk-badge vk-badge-prod",
  staging:     "vk-badge vk-badge-staging",
  development: "vk-badge vk-badge-dev",
  other:       "vk-badge vk-badge-note",
};

export function EnvironmentBadge({ env }: { env: string }) {
  const cls = MAP[env] ?? MAP.other;
  return <span className={cls}>{env}</span>;
}
