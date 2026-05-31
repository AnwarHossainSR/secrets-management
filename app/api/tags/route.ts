import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { requireSession } from "@/lib/session-guard";

export async function GET() {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  const agg = await Entry.aggregate([
    { $match: { owner: new (await import("mongoose")).Types.ObjectId(s.userId), deletedAt: null } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  return Response.json({ tags: agg.map((t) => ({ tag: t._id, count: t.count })) });
}
