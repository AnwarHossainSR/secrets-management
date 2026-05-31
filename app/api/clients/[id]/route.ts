import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Entry } from "@/models/Entry";
import { Project } from "@/models/Project";
import { requireSession } from "@/lib/session-guard";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const client = await Client.findOne({ _id: id, owner: s.userId }).lean();
  if (!client) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ client: { ...client, _id: String(client._id) } });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const c = await Client.findOne({ _id: id, owner: s.userId });
  if (!c) return Response.json({ error: "Not found" }, { status: 404 });
  if (body.name) c.name = body.name;
  if (body.slug) c.slug = String(body.slug).toUpperCase().slice(0, 6);
  if (body.color) c.color = body.color;
  if (body.status) c.status = body.status;
  await c.save();
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const c = await Client.findOne({ _id: id, owner: s.userId });
  if (!c) return Response.json({ error: "Not found" }, { status: 404 });
  await Entry.updateMany({ client: id, owner: s.userId }, { $set: { deletedAt: new Date() } });
  await Project.deleteMany({ client: id, owner: s.userId });
  await c.deleteOne();
  return Response.json({ ok: true });
}
