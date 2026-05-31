import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { requireSession } from "@/lib/session-guard";

export async function GET() {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  const [totalEntries, activeClients, pinned, secretsAgg] = await Promise.all([
    Entry.countDocuments({ owner: s.userId, deletedAt: null }),
    Client.countDocuments({ owner: s.userId, status: "active" }),
    Entry.countDocuments({ owner: s.userId, deletedAt: null, isPinned: true }),
    Entry.aggregate([
      { $match: { owner: new (await import("mongoose")).Types.ObjectId(s.userId), deletedAt: null } },
      { $unwind: "$fields" },
      { $match: { "fields.isSecret": true } },
      { $count: "n" },
    ]),
  ]);
  return Response.json({
    totalEntries,
    activeClients,
    pinned,
    secrets: secretsAgg[0]?.n ?? 0,
  });
}
