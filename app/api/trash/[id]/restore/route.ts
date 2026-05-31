import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { requireSession } from "@/lib/session-guard";
import { logActivity } from "@/lib/activity";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const e = await Entry.findOneAndUpdate(
    { _id: id, owner: s.userId },
    { $set: { deletedAt: null } },
    { new: true }
  );
  if (!e) return Response.json({ error: "Not found" }, { status: 404 });
  await logActivity({
    userId: s.userId,
    action: "entry_restored",
    entryId: id,
    entryTitle: e.title,
    clientId: String(e.client),
  });
  return Response.json({ ok: true });
}
