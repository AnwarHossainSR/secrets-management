import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { requireSession } from "@/lib/session-guard";

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const e = await Entry.findOne({ _id: id, owner: s.userId });
  if (!e) return Response.json({ error: "Not found" }, { status: 404 });
  e.isPinned = !e.isPinned;
  await e.save();
  return Response.json({ isPinned: e.isPinned });
}
