import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { Entry } from "@/models/Entry";
import { requireSession } from "@/lib/session-guard";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const p = await Project.findOne({ _id: id, owner: s.userId }).populate("client", "name slug color").lean();
  if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ project: { ...p, _id: String(p._id) } });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const p = await Project.findOne({ _id: id, owner: s.userId });
  if (!p) return Response.json({ error: "Not found" }, { status: 404 });
  if (body.name) p.name = body.name;
  if (body.description !== undefined) p.description = body.description;
  await p.save();
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  await Entry.updateMany({ project: id, owner: s.userId }, { $set: { project: null } });
  await Project.deleteOne({ _id: id, owner: s.userId });
  return Response.json({ ok: true });
}
