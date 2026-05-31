import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { decrypt } from "@/lib/encryption";
import { EntryForm } from "../../_form";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  await dbConnect();
  const entry = await Entry.findOne({ _id: id, owner: session!.user.id }).lean();
  if (!entry) notFound();

  const [clients, projects] = await Promise.all([
    Client.find({ owner: session!.user.id }).sort({ name: 1 }).lean(),
    Project.find({ owner: session!.user.id }).lean(),
  ]);

  const initial = {
    _id: String(entry._id),
    title: entry.title,
    type: entry.type,
    client: String(entry.client),
    project: entry.project ? String(entry.project) : null,
    environment: entry.environment,
    tags: entry.tags ?? [],
    isPinned: !!entry.isPinned,
    notes: entry.notes ?? "",
    fields: (entry.fields ?? []).map((f) => {
      let v = "";
      try {
        v = decrypt(f.value);
      } catch {
        v = "";
      }
      return { label: f.label, value: v, isSecret: !!f.isSecret };
    }),
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Entry</h1>
      <EntryForm
        clients={clients.map((c) => ({ _id: String(c._id), name: c.name }))}
        projects={projects.map((p) => ({ _id: String(p._id), name: p.name, client: String(p.client) }))}
        initial={initial}
      />
    </div>
  );
}
