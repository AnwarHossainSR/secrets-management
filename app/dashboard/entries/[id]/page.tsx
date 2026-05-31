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
import { Pencil, Lock } from "lucide-react";

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

  const clientObj = entry.client as unknown as { _id: unknown; name: string; slug: string; color: string } | null;
  const projObj = entry.project as unknown as { name: string } | null;
  const secretCount = entry.fields.filter((f) => f.isSecret).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <nav className="text-xs vk-faint flex items-center gap-1">
        <Link href="/dashboard/entries" className="hover:underline">Entries</Link>
        <span>/</span>
        <span className="vk-muted truncate">{entry.title}</span>
      </nav>

      <div className="vk-card rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold vk-text">{entry.title}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <TypeBadge type={entry.type} />
              <EnvironmentBadge env={entry.environment} />
              {clientObj && (
                <ClientPill slug={clientObj.slug} color={clientObj.color} name={clientObj.name} />
              )}
              {projObj && (
                <span className="text-xs vk-muted">/ {projObj.name}</span>
              )}
            </div>
            <p className="text-xs vk-faint mt-3 inline-flex items-center gap-1.5">
              <Lock className="size-3" />
              {secretCount} encrypted field{secretCount === 1 ? "" : "s"}
              {" · "}
              Updated {new Date(entry.updatedAt as unknown as string).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/dashboard/entries/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm hover:bg-[var(--card-inner)]"
              style={{ border: "1px solid var(--border)", color: "var(--text)" }}
            >
              <Pencil className="size-4" /> Edit
            </Link>
            <EntryActions id={id} isPinned={!!entry.isPinned} />
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm uppercase tracking-wider vk-faint">Fields</h2>
          <span className="text-xs vk-faint">Click eye to reveal · Copy to clipboard</span>
        </div>
        {entry.fields.length === 0 ? (
          <p className="vk-card rounded-md p-6 text-center text-sm vk-muted">No fields.</p>
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
          <h2 className="text-sm uppercase tracking-wider vk-faint mb-2">Tags</h2>
          <div className="flex flex-wrap gap-1.5">
            {entry.tags.map((t) => (
              <span
                key={t}
                className="text-xs rounded px-2 py-0.5"
                style={{ background: "var(--card-inner)", color: "var(--text-muted)", border: "1px solid var(--border)" }}
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {entry.notes && (
        <section>
          <h2 className="text-sm uppercase tracking-wider vk-faint mb-2">Notes</h2>
          <p className="vk-card rounded-md p-3 whitespace-pre-wrap text-sm vk-text">{entry.notes}</p>
        </section>
      )}
    </div>
  );
}
