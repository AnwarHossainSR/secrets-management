import Link from "next/link";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Project } from "@/models/Project";
import { Client } from "@/models/Client";
import { Entry } from "@/models/Entry";
import { ClientPill } from "@/components/ClientPill";
import { ProjectCreate } from "./_create";
import { Types } from "mongoose";

export default async function ProjectsPage() {
  const session = await auth();
  await dbConnect();
  const userId = session!.user.id;
  const ownerId = new Types.ObjectId(userId);
  const [projects, clients, counts] = await Promise.all([
    Project.find({ owner: userId }).populate("client", "name slug color").sort({ createdAt: -1 }).lean(),
    Client.find({ owner: userId }).sort({ name: 1 }).lean(),
    Entry.aggregate([
      { $match: { owner: ownerId, deletedAt: null, project: { $ne: null } } },
      { $group: { _id: "$project", count: { $sum: 1 } } },
    ]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));

  // Group by client
  const groups: Record<string, typeof projects> = {};
  for (const p of projects) {
    const cid = String((p.client as unknown as { _id: unknown })._id);
    groups[cid] = groups[cid] ?? [];
    groups[cid].push(p);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <ProjectCreate clients={clients.map((c) => ({ _id: String(c._id), name: c.name }))} />
      </div>
      {Object.keys(groups).length === 0 ? (
        <p className="vk-card rounded-xl p-6 text-center text-neutral-500 text-sm">No projects yet.</p>
      ) : (
        Object.entries(groups).map(([cid, ps]) => {
          const c = ps[0].client as unknown as { name: string; slug: string; color: string };
          return (
            <div key={cid}>
              <div className="flex items-center gap-2 mb-2">
                <ClientPill slug={c.slug} color={c.color} name={c.name} />
                <span className="text-sm text-neutral-400">{c.name}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {ps.map((p) => (
                  <Link
                    key={String(p._id)}
                    href={`/dashboard/entries?client=${cid}`}
                    className="vk-card rounded-lg p-3 hover:border-neutral-600"
                  >
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-neutral-500 mt-1">{map.get(String(p._id)) ?? 0} entries</p>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
