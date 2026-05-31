import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { decrypt, encrypt } from "@/lib/encryption";
import { requireSession } from "@/lib/session-guard";

type ImportEntry = {
  title: string;
  type?: string;
  client: string;
  project?: string | null;
  fields?: { label: string; value: string; isSecret?: boolean }[];
  tags?: string[];
  isPinned?: boolean;
  environment?: string;
  notes?: string;
};
type ImportClient = { _id: string; name: string; slug: string; color: string; status?: string };
type ImportProject = { _id: string; name: string; client: string; description?: string };

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();

  const body = await req.json().catch(() => null);
  if (!body || body.format !== "vaultkit/v1" || !body.payload) {
    return Response.json({ error: "Invalid file" }, { status: 400 });
  }

  let plain: { clients: ImportClient[]; projects: ImportProject[]; entries: ImportEntry[] };
  try {
    plain = JSON.parse(decrypt(body.payload));
  } catch {
    return Response.json({ error: "Decryption failed" }, { status: 400 });
  }

  const clientMap = new Map<string, string>();
  for (const c of plain.clients ?? []) {
    const existing = await Client.findOne({ owner: s.userId, slug: c.slug });
    if (existing) {
      clientMap.set(c._id, String(existing._id));
    } else {
      const created = await Client.create({
        name: c.name,
        slug: c.slug,
        color: c.color,
        status: (c.status ?? "active") as "active" | "maintenance" | "archived",
        owner: s.userId,
      });
      clientMap.set(c._id, String(created._id));
    }
  }

  const projectMap = new Map<string, string>();
  for (const p of plain.projects ?? []) {
    const clientId = clientMap.get(p.client);
    if (!clientId) continue;
    const created = await Project.create({
      name: p.name,
      client: clientId,
      description: p.description ?? "",
      owner: s.userId,
    });
    projectMap.set(p._id, String(created._id));
  }

  let imported = 0;
  for (const e of plain.entries ?? []) {
    const clientId = clientMap.get(e.client);
    if (!clientId) continue;
    type EntryType = "server" | "email" | "api" | "database" | "deployment" | "note" | "other";
    type EnvType = "production" | "staging" | "development" | "other";
    await Entry.create({
      title: e.title,
      type: (e.type ?? "other") as EntryType,
      client: clientId,
      project: e.project ? projectMap.get(e.project) ?? null : null,
      owner: s.userId,
      fields: (e.fields ?? []).map((f) => ({
        label: f.label,
        value: encrypt(f.value),
        isSecret: f.isSecret !== false,
      })),
      tags: e.tags ?? [],
      isPinned: !!e.isPinned,
      environment: (e.environment ?? "production") as EnvType,
      notes: e.notes ?? "",
    });
    imported++;
  }

  return Response.json({ ok: true, imported });
}
