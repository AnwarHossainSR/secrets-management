/**
 * Minimal .env parser. Supports:
 *  - KEY=value
 *  - KEY="quoted value"
 *  - KEY='quoted value'
 *  - blank lines + # comments
 *  - export KEY=value
 *  - escaped \n inside double quotes
 */
export type EnvPair = { key: string; value: string };

export function parseEnv(text: string): EnvPair[] {
  const out: EnvPair[] = [];
  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2];

    // strip inline comment if unquoted
    const isDouble = value.startsWith('"') && value.endsWith('"') && value.length >= 2;
    const isSingle = value.startsWith("'") && value.endsWith("'") && value.length >= 2;

    if (isDouble) {
      value = value.slice(1, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
    } else if (isSingle) {
      value = value.slice(1, -1);
    } else {
      const hashIdx = value.indexOf(" #");
      if (hashIdx !== -1) value = value.slice(0, hashIdx);
      value = value.trim();
    }
    out.push({ key, value });
  }
  return out;
}

export function serializeEnv(pairs: EnvPair[]): string {
  return pairs
    .map(({ key, value }) => {
      // quote if value has spaces, special chars or newlines
      const needsQuote = /[\s#"'$`\\]/.test(value) || value.includes("=");
      if (needsQuote) {
        const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
        return `${key}="${escaped}"`;
      }
      return `${key}=${value}`;
    })
    .join("\n") + "\n";
}
