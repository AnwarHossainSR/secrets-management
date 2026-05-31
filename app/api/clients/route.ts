import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Entry } from "@/models/Entry";
import { Project } from "@/models/Project";
import { requireSession } from "@/lib/session-guard";

export async function GET() {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  const clients = await Client.find({ owner: s.userId }).sort({ name: 1 }).lean();
  const entryCounts = await Entry.aggregate([
    { $match: { owner: new (await import("mongoose")).Types.ObjectId(s.userId), deletedAt: null } },
    { $group: { _id: "$client", count: { $sum: 1 } } },
  ]);
  const projectCounts = await Project.aggregate([
    { $match: { owner: new (await import("mongoose")).Types.ObjectId(s.userId) } },
    { $group: { _id: "$client", count: { $sum: 1 } } },
  ]);
  const eMap = new Map(entryCounts.map((c) => [String(c._id), c.count]));
  const pMap = new Map(projectCounts.map((c) => [String(c._id), c.count]));

  return Response.json({
    clients: clients.map((c) => ({
      ...c,
      _id: String(c._id),
      entryCount: eMap.get(String(c._id)) ?? 0,
      projectCount: pMap.get(String(c._id)) ?? 0,
    })),
  });
}

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const slug = String(body.slug ?? "").toUpperCase().trim().slice(0, 6);
  const color = String(body.color ?? "#f59e0b");
  const status = ["active", "maintenance", "archived"].includes(body.status) ? body.status : "active";
  if (!name || !slug) return Response.json({ error: "Name and slug required" }, { status: 400 });
  await dbConnect();
  try {
    const c = await Client.create({ name, slug, color, status, owner: s.userId });
    return Response.json({ id: String(c._id) }, { status: 201 });
  } catch {
    return Response.json({ error: "Slug taken" }, { status: 409 });
  }
}
