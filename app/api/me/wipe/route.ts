import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { ActivityLog } from "@/models/ActivityLog";
import { requireSession } from "@/lib/session-guard";

export async function POST() {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  await Promise.all([
    Entry.deleteMany({ owner: s.userId }),
    Client.deleteMany({ owner: s.userId }),
    Project.deleteMany({ owner: s.userId }),
    ActivityLog.deleteMany({ user: s.userId }),
  ]);
  return Response.json({ ok: true });
}
