import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { TypeBadge } from "@/components/TypeBadge";
import { EnvironmentBadge } from "@/components/EnvironmentBadge";
import { ClientPill } from "@/components/ClientPill";
import { FieldRow } from "@/components/FieldRow";
import { EntryActions } from "./_actions";
import { Pencil } from "lucide-react";

export default async function EntryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  await dbConnect();
  const entry = await Entry.findOne({ _id: id, owner: session!.user.id })
    .populate("client", "name slug color")
    .populate("project", "name")
    .lean();
  if (!entry) notFound();

  await Entry.updateOne({ _id: id }, { $set: { lastViewedAt: new Date() } });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{entry.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <TypeBadge type={entry.type} />
            <EnvironmentBadge env={entry.environment} />
            {entry.client && (
              <ClientPill
                slug={(entry.client as unknown as { slug: string }).slug}
                color={(entry.client as unknown as { color: string }).color}
                name={(entry.client as unknown as { name: string }).name}
              />
            )}
            {entry.project && (
              <span className="text-xs text-neutral-400">
                · {(entry.project as unknown as { name: string }).name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/entries/${id}/edit`}
            className="inline-flex items-center gap-1.5 border vk-border px-3 py-2 rounded-lg text-sm hover:bg-white/5"
          >
            <Pencil className="size-4" /> Edit
          </Link>
          <EntryActions id={id} isPinned={!!entry.isPinned} />
        </div>
      </div>

      <section>
        <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">Fields</h2>
        {entry.fields.length === 0 ? (
          <p className="text-sm text-neutral-500">No fields.</p>
        ) : (
          <div className="space-y-2">
            {entry.fields.map((f, i) => (
              <FieldRow key={i} entryId={id} fieldIndex={i} label={f.label} isSecret={!!f.isSecret} />
            ))}
          </div>
        )}
      </section>

      {entry.tags?.length > 0 && (
        <section>
          <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span key={t} className="text-xs bg-white/5 rounded px-2 py-0.5">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {entry.notes && (
        <section>
          <h2 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">Notes</h2>
          <p className="vk-card rounded-lg p-3 whitespace-pre-wrap text-sm">{entry.notes}</p>
        </section>
      )}
    </div>
  );
}
