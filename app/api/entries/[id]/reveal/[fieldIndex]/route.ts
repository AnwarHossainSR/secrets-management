import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { decrypt } from "@/lib/encryption";
import { requireSession } from "@/lib/session-guard";
import { logActivity } from "@/lib/activity";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; fieldIndex: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id, fieldIndex } = await ctx.params;
  const idx = Number(fieldIndex);
  if (!Number.isInteger(idx) || idx < 0) return Response.json({ error: "Bad index" }, { status: 400 });

  await dbConnect();
  const entry = await Entry.findOne({ _id: id, owner: s.userId }).lean();
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  const field = entry.fields?.[idx];
  if (!field) return Response.json({ error: "Field not found" }, { status: 404 });

  let value: string;
  try {
    value = decrypt(field.value);
  } catch {
    return Response.json({ error: "Decrypt failed" }, { status: 500 });
  }

  await logActivity({
    userId: s.userId,
    action: `field_revealed:${field.label}`,
    entryId: id,
    entryTitle: entry.title,
    clientId: String(entry.client),
  });

  return Response.json({ value });
}
