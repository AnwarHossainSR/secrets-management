import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Entry } from "@/models/Entry";
import { Project } from "@/models/Project";
import { StatusBadge } from "@/components/StatusBadge";
import { TypeBadge } from "@/components/TypeBadge";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  await dbConnect();
  const userId = session!.user.id;
  const client = await Client.findOne({ _id: id, owner: userId }).lean();
  if (!client) notFound();

  const [entries, projects] = await Promise.all([
    Entry.find({ owner: userId, client: id, deletedAt: null }).sort({ updatedAt: -1 }).lean(),
    Project.find({ owner: userId, client: id }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="size-12 rounded-xl grid place-items-center font-semibold"
            style={{ background: client.color + "22", color: client.color }}
          >
            {client.slug}
          </span>
          <div>
            <h1 className="text-2xl font-semibold">{client.name}</h1>
            <div className="mt-1"><StatusBadge status={client.status} /></div>
          </div>
        </div>
        <Link
          href={`/dashboard/clients/${id}/edit`}
          className="inline-flex items-center gap-1.5 border vk-border px-3 py-2 rounded-lg text-sm hover:bg-white/5"
        >
          <Pencil className="size-4" /> Edit
        </Link>
      </div>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <p className="text-sm text-neutral-500">No projects.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((p) => (
              <div key={String(p._id)} className="vk-card rounded-lg p-3">
                <p className="font-medium">{p.name}</p>
                {p.description && <p className="text-sm text-neutral-400 mt-1">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">Entries ({entries.length})</h2>
        <div className="vk-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-neutral-500 bg-white/[0.02]">
              <tr>
                <th className="text-left px-4 py-2">Title</th>
                <th className="text-left px-4 py-2">Type</th>
                <th className="text-left px-4 py-2">Env</th>
                <th className="text-left px-4 py-2">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-neutral-500">
                    No entries.
                  </td>
                </tr>
              )}
              {entries.map((e) => (
                <tr key={String(e._id)} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2">
                    <Link href={`/dashboard/entries/${String(e._id)}`} className="hover:underline">
                      {e.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2"><TypeBadge type={e.type} /></td>
                  <td className="px-4 py-2"><EnvironmentBadge env={e.environment} /></td>
                  <td className="px-4 py-2 text-neutral-400">
                    {new Date(e.updatedAt as unknown as string).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
