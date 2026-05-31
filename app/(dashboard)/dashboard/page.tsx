import Link from "next/link";
import { Download, Plus, KeyRound, Users, Pin, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { ActivityLog } from "@/models/ActivityLog";
import { StatCard } from "@/components/StatCard";
import { EntryCard } from "@/components/EntryCard";
import { ClientCard } from "@/components/ClientCard";
import { ActivityFeedItem } from "@/components/ActivityFeedItem";
import { Types } from "mongoose";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  await dbConnect();

  const ownerId = new Types.ObjectId(userId);
  const [totalEntries, activeClients, pinnedCount, secretsAgg, pinned, clients, recent] = await Promise.all([
    Entry.countDocuments({ owner: userId, deletedAt: null }),
    Client.countDocuments({ owner: userId, status: "active" }),
    Entry.countDocuments({ owner: userId, deletedAt: null, isPinned: true }),
    Entry.aggregate([
      { $match: { owner: ownerId, deletedAt: null } },
      { $unwind: "$fields" },
      { $match: { "fields.isSecret": true } },
      { $count: "n" },
    ]),
    Entry.find({ owner: userId, deletedAt: null, isPinned: true })
      .limit(3)
      .populate("client", "name slug color")
      .lean(),
    Client.find({ owner: userId }).sort({ createdAt: -1 }).lean(),
    ActivityLog.find({ user: userId }).sort({ timestamp: -1 }).limit(10).lean(),
  ]);

  const entryCounts = await Entry.aggregate([
    { $match: { owner: ownerId, deletedAt: null } },
    { $group: { _id: "$client", count: { $sum: 1 } } },
  ]);
  const projectCounts = await Project.aggregate([
    { $match: { owner: ownerId } },
    { $group: { _id: "$client", count: { $sum: 1 } } },
  ]);
  const eMap = new Map(entryCounts.map((c) => [String(c._id), c.count]));
  const pMap = new Map(projectCounts.map((c) => [String(c._id), c.count]));

  const secrets = secretsAgg[0]?.n ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {session!.user.name}</h1>
          <p className="text-neutral-400 text-sm mt-1">Your secrets, organized.</p>
        </div>
        <div className="flex items-center gap-2">
          <form action="/api/export" method="POST">
            <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border vk-border text-sm hover:bg-white/5">
              <Download className="size-4" />
              Export
            </button>
          </form>
          <Link
            href="/dashboard/entries/new"
            className="inline-flex items-center gap-1.5 vk-accent-bg px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="size-4" />
            New Entry
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Vaults" value={totalEntries} Icon={KeyRound} />
        <StatCard label="Active Clients" value={activeClients} Icon={Users} />
        <StatCard label="Pinned" value={pinnedCount} Icon={Pin} />
        <StatCard label="Secrets Stored" value={secrets} Icon={Lock} />
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Quick Access</h2>
          <Link href="/dashboard/entries?pinned=1" className="text-xs vk-accent hover:underline">
            View all
          </Link>
        </div>
        {pinned.length === 0 ? (
          <p className="text-sm text-neutral-500 vk-card rounded-xl p-6 text-center">
            No pinned vaults yet. Pin entries from their detail page.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {pinned.map((e) => (
              <EntryCard
                key={String(e._id)}
                entry={{
                  _id: String(e._id),
                  title: e.title,
                  type: e.type,
                  isPinned: e.isPinned,
                  client: e.client && {
                    _id: String((e.client as unknown as { _id: unknown })._id),
                    name: (e.client as unknown as { name: string }).name,
                    slug: (e.client as unknown as { slug: string }).slug,
                    color: (e.client as unknown as { color: string }).color,
                  },
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Engagements</h2>
          <Link href="/dashboard/clients/new" className="text-xs vk-accent hover:underline">
            + New Client
          </Link>
        </div>
        {clients.length === 0 ? (
          <p className="text-sm text-neutral-500 vk-card rounded-xl p-6 text-center">
            No clients yet. <Link href="/dashboard/clients/new" className="vk-accent">Create one</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {clients.map((c) => (
              <ClientCard
                key={String(c._id)}
                client={{
                  _id: String(c._id),
                  name: c.name,
                  slug: c.slug,
                  color: c.color,
                  status: c.status,
                  entryCount: eMap.get(String(c._id)) ?? 0,
                  projectCount: pMap.get(String(c._id)) ?? 0,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/dashboard/history" className="text-xs vk-accent hover:underline">
            Full history
          </Link>
        </div>
        <div className="vk-card rounded-xl p-3 divide-y divide-[#232a3a]">
          {recent.length === 0 ? (
            <p className="text-sm text-neutral-500 p-4 text-center">No activity yet.</p>
          ) : (
            recent.map((r) => (
              <ActivityFeedItem
                key={String(r._id)}
                action={r.action}
                entryTitle={r.entryTitle}
                timestamp={r.timestamp.toISOString()}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
