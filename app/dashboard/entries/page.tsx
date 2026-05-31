import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { TypeBadge } from "@/components/TypeBadge";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { ClientPill } from "@/components/ClientPill";
import { EntriesFilters } from "./_filters";

export default async function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const userId = session!.user.id;
  await dbConnect();

  const filter: Record<string, unknown> = { owner: userId, deletedAt: null };
  if (sp.client) filter.client = sp.client;
  if (sp.type) filter.type = sp.type;
  if (sp.environment) filter.environment = sp.environment;
  if (sp.tag) filter.tags = sp.tag;
  if (sp.pinned === "1") filter.isPinned = true;
  if (sp.q) filter.title = new RegExp(sp.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    viewed: { lastViewedAt: -1 },
    name: { title: 1 },
  };
  const sort = sortMap[sp.sort ?? "newest"] ?? sortMap.newest;

  const [items, clients] = await Promise.all([
    Entry.find(filter).sort(sort).populate("client", "name slug color").lean(),
    Client.find({ owner: userId }).sort({ name: 1 }).lean(),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">All Entries</h1>
          <p className="text-sm text-neutral-400 mt-1">{items.length} results</p>
        </div>
        <Link
          href="/dashboard/entries/new"
          className="inline-flex items-center gap-1.5 vk-accent-bg px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="size-4" /> New Entry
        </Link>
      </div>

      <EntriesFilters
        clients={clients.map((c) => ({ _id: String(c._id), name: c.name, slug: c.slug }))}
        initial={sp}
      />

      <div className="vk-card rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wide text-neutral-500 bg-white/[0.02]">
            <tr>
              <th className="text-left px-4 py-2">Title</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Client</th>
              <th className="text-left px-4 py-2">Env</th>
              <th className="text-left px-4 py-2">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-neutral-500">
                  No entries.
                </td>
              </tr>
            )}
            {items.map((e) => (
              <tr key={String(e._id)} className="hover:bg-white/[0.02]">
                <td className="px-4 py-2">
                  <Link href={`/dashboard/entries/${String(e._id)}`} className="hover:underline">
                    {e.title}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <TypeBadge type={e.type} />
                </td>
                <td className="px-4 py-2">
                  {e.client && (
                    <ClientPill
                      slug={(e.client as unknown as { slug: string }).slug}
                      color={(e.client as unknown as { color: string }).color}
                      name={(e.client as unknown as { name: string }).name}
                    />
                  )}
                </td>
                <td className="px-4 py-2">
                  <EnvironmentBadge env={e.environment} />
                </td>
                <td className="px-4 py-2 text-neutral-400">
                  {new Date(e.updatedAt as unknown as string).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
