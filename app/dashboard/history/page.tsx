import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { ActivityLog } from "@/models/ActivityLog";
import { ActivityFeedItem } from "@/components/ActivityFeedItem";

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();
  await dbConnect();
  const filter: Record<string, unknown> = { user: session!.user.id };
  if (sp.action) filter.action = sp.action;
  if (sp.client) filter.clientId = sp.client;
  if (sp.from || sp.to) {
    const ts: Record<string, Date> = {};
    if (sp.from) ts.$gte = new Date(sp.from);
    if (sp.to) ts.$lte = new Date(sp.to);
    filter.timestamp = ts;
  }
  const logs = await ActivityLog.find(filter).sort({ timestamp: -1 }).limit(500).lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>
      <div className="vk-card rounded-xl p-3 flex gap-2 flex-wrap items-center text-sm">
        <input
          name="action"
          placeholder="Filter by actionâ€¦"
          defaultValue={sp.action ?? ""}
          className="bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5"
        />
        <input
          type="date"
          name="from"
          defaultValue={sp.from ?? ""}
          className="bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5"
        />
        <input
          type="date"
          name="to"
          defaultValue={sp.to ?? ""}
          className="bg-[#1a1a1a] border vk-border rounded-md px-2 py-1.5"
        />
      </div>
      <div className="vk-card rounded-xl p-3 divide-y divide-[#222222]">
        {logs.length === 0 ? (
          <p className="text-sm text-neutral-500 p-4 text-center">No activity.</p>
        ) : (
          logs.map((l) => (
            <ActivityFeedItem
              key={String(l._id)}
              action={l.action}
              entryTitle={l.entryTitle}
              timestamp={l.timestamp.toISOString()}
            />
          ))
        )}
      </div>
    </div>
  );
}
