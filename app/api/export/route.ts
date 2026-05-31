import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { decrypt, encrypt } from "@/lib/encryption";
import { requireSession } from "@/lib/session-guard";

export async function POST() {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  const [clients, projects, entries] = await Promise.all([
    Client.find({ owner: s.userId }).lean(),
    Project.find({ owner: s.userId }).lean(),
    Entry.find({ owner: s.userId }).lean(),
  ]);

  const plain = {
    exportedAt: new Date().toISOString(),
    clients: clients.map((c) => ({ ...c, _id: String(c._id) })),
    projects: projects.map((p) => ({ ...p, _id: String(p._id), client: String(p.client) })),
    entries: entries.map((e) => ({
      ...e,
      _id: String(e._id),
      client: String(e.client),
      project: e.project ? String(e.project) : null,
      fields: e.fields.map((f) => ({ label: f.label, value: decrypt(f.value), isSecret: f.isSecret })),
    })),
  };

  // Re-encrypt the whole payload as a single ciphertext block
  const blob = encrypt(JSON.stringify(plain));
  return new Response(JSON.stringify({ format: "vaultkit/v1", payload: blob }), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="vaultkit-export-${Date.now()}.json"`,
    },
  });
}
