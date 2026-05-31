import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { Client } from "@/models/Client";
import { Entry } from "@/models/Entry";
import { requireSession } from "@/lib/session-guard";

export async function GET() {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  const projects = await Project.find({ owner: s.userId })
    .populate({ path: "client", select: "name slug color" })
    .sort({ createdAt: -1 })
    .lean();
  const counts = await Entry.aggregate([
    { $match: { owner: new (await import("mongoose")).Types.ObjectId(s.userId), deletedAt: null, project: { $ne: null } } },
    { $group: { _id: "$project", count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  return Response.json({
    projects: projects.map((p) => ({
      ...p,
      _id: String(p._id),
      client: p.client && { ...p.client, _id: String((p.client as { _id: unknown })._id) },
      entryCount: map.get(String(p._id)) ?? 0,
    })),
  });
}

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const clientId = String(body.client ?? "");
  if (!name || !clientId) return Response.json({ error: "Name and client required" }, { status: 400 });
  const c = await Client.findOne({ _id: clientId, owner: s.userId });
  if (!c) return Response.json({ error: "Client not found" }, { status: 404 });
  const p = await Project.create({ name, client: clientId, description: body.description ?? "", owner: s.userId });
  return Response.json({ id: String(p._id) }, { status: 201 });
}
