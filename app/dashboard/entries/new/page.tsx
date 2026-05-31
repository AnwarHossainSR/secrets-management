import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { NewEntryTabs } from "./_tabs";

export default async function NewEntryPage() {
  const session = await auth();
  await dbConnect();
  const [clients, projects] = await Promise.all([
    Client.find({ owner: session!.user.id }).sort({ name: 1 }).lean(),
    Project.find({ owner: session!.user.id }).lean(),
  ]);
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider vk-faint">Entries</p>
        <h1 className="text-2xl font-semibold vk-text mt-1">Create new entry</h1>
        <p className="text-sm vk-muted mt-1">
          Add credentials manually or import a <code className="vk-mono">.env</code> file. Every secret is encrypted with AES-256 before it touches the database.
        </p>
      </div>
      <NewEntryTabs
        clients={clients.map((c) => ({ _id: String(c._id), name: c.name }))}
        projects={projects.map((p) => ({ _id: String(p._id), name: p.name, client: String(p.client) }))}
      />
    </div>
  );
}
