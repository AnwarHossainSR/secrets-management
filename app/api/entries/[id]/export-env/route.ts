import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { decrypt } from "@/lib/encryption";
import { requireSession } from "@/lib/session-guard";
import { logActivity } from "@/lib/activity";
import { serializeEnv } from "@/lib/env-parser";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();

  const entry = await Entry.findOne({ _id: id, owner: s.userId }).lean();
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });

  const pairs = (entry.fields ?? []).map((f) => {
    let value = "";
    try { value = decrypt(f.value); } catch { /* skip */ }
    return { key: f.label.toUpperCase().replace(/[^A-Z0-9_]/g, "_"), value };
  });

  const body = `# ${entry.title} (${entry.environment})\n# Exported ${new Date().toISOString()}\n\n${serializeEnv(pairs)}`;
  const safe = entry.title.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 40);

  await logActivity({
    userId: s.userId,
    action: "env_exported",
    entryId: id,
    entryTitle: entry.title,
    clientId: String(entry.client),
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safe || "vault"}.env"`,
    },
  });
}
