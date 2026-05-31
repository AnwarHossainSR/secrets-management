import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Entry } from "@/models/Entry";
import { Project } from "@/models/Project";
import { ClientCard } from "@/components/ClientCard";
import { Types } from "mongoose";

export default async function ClientsPage() {
  const session = await auth();
  await dbConnect();
  const userId = session!.user.id;
  const ownerId = new Types.ObjectId(userId);
  const [clients, eCounts, pCounts] = await Promise.all([
    Client.find({ owner: userId }).sort({ name: 1 }).lean(),
    Entry.aggregate([
      { $match: { owner: ownerId, deletedAt: null } },
      { $group: { _id: "$client", count: { $sum: 1 } } },
    ]),
    Project.aggregate([{ $match: { owner: ownerId } }, { $group: { _id: "$client", count: { $sum: 1 } } }]),
  ]);
  const eMap = new Map(eCounts.map((c) => [String(c._id), c.count]));
  const pMap = new Map(pCounts.map((c) => [String(c._id), c.count]));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link href="/dashboard/clients/new" className="vk-accent-bg inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium">
          <Plus className="size-4" /> New Client
        </Link>
      </div>
      {clients.length === 0 ? (
        <p className="vk-card rounded-xl p-6 text-center text-neutral-500 text-sm">No clients yet.</p>
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
    </div>
  );
}
