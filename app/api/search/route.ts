import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { requireSession } from "@/lib/session-guard";

export async function GET(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return Response.json({ entries: [], clients: [] });

  await dbConnect();
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const entries = await Entry.find({
    owner: s.userId,
    deletedAt: null,
    $or: [{ title: rx }, { tags: rx }, { "fields.label": rx }],
  })
    .limit(20)
    .populate("client", "name slug color")
    .lean();

  const clients = await Client.find({ owner: s.userId, $or: [{ name: rx }, { slug: rx }] }).limit(10).lean();

  return Response.json({
    entries: entries.map((e) => ({
      _id: String(e._id),
      title: e.title,
      type: e.type,
      clientName: e.client ? (e.client as unknown as { name: string }).name : undefined,
    })),
    clients: clients.map((c) => ({ ...c, _id: String(c._id) })),
  });
}
