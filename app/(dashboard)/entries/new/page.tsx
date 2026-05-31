import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { EntryForm } from "../_form";

export default async function NewEntryPage() {
  const session = await auth();
  await dbConnect();
  const [clients, projects] = await Promise.all([
    Client.find({ owner: session!.user.id }).sort({ name: 1 }).lean(),
    Project.find({ owner: session!.user.id }).lean(),
  ]);
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">New Entry</h1>
      <EntryForm
        clients={clients.map((c) => ({ _id: String(c._id), name: c.name }))}
        projects={projects.map((p) => ({ _id: String(p._id), name: p.name, client: String(p.client) }))}
      />
    </div>
  );
}
