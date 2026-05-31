import { dbConnect } from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { requireSession } from "@/lib/session-guard";

export async function GET(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Number(searchParams.get("limit") ?? 10));
  await dbConnect();
  const logs = await ActivityLog.find({ user: s.userId }).sort({ timestamp: -1 }).limit(limit).lean();
  return Response.json({
    activity: logs.map((l) => ({ ...l, _id: String(l._id), timestamp: l.timestamp.toISOString() })),
  });
}
