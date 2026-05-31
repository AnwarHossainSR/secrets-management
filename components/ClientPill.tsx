const PALETTE = ["#f59e0b", "#34d399", "#60a5fa", "#f87171", "#c084fc", "#fb923c", "#e879f9", "#38bdf8"];

function pickColor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

// hex (#rrggbb) blend with #0a0a0a at ~15% strength = mostly black + 15% color
function mixed(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * 0.15 + 10 * 0.85);
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(mix(r))}${to2(mix(g))}${to2(mix(b))}`;
}

export function ClientPill({ slug, color, name }: { slug: string; color?: string; name?: string }) {
  const accent = color && /^#[0-9a-fA-F]{6}$/.test(color) ? color : pickColor(slug);
  const bg = mixed(accent);
  return (
    <span
      className="vk-badge"
      style={{ background: bg, color: accent, border: `1px solid ${accent}44` }}
      title={name}
    >
      {slug}
    </span>
  );
}
