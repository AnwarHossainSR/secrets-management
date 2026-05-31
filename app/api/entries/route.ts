import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { Project } from "@/models/Project";
import { encrypt } from "@/lib/encryption";
import { requireSession } from "@/lib/session-guard";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const filter: Record<string, unknown> = { owner: s.userId, deletedAt: null };
  const client = searchParams.get("client");
  const type = searchParams.get("type");
  const env = searchParams.get("environment");
  const tag = searchParams.get("tag");
  if (client) filter.client = client;
  if (type) filter.type = type;
  if (env) filter.environment = env;
  if (tag) filter.tags = tag;

  const sortKey = searchParams.get("sort") ?? "newest";
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    viewed: { lastViewedAt: -1 },
    name: { title: 1 },
  };

  const items = await Entry.find(filter)
    .sort(sortMap[sortKey] ?? sortMap.newest)
    .populate({ path: "client", select: "name slug color" })
    .populate({ path: "project", select: "name" })
    .lean();

  // Strip ciphertext from list view
  const stripped = items.map((e) => ({
    ...e,
    _id: String(e._id),
    client: e.client && { ...e.client, _id: String((e.client as { _id: unknown })._id) },
    project: e.project && { ...e.project, _id: String((e.project as { _id: unknown })._id) },
    fields: (e.fields ?? []).map((f) => ({ label: f.label, isSecret: f.isSecret })),
  }));

  return Response.json({ entries: stripped });
}

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();

  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const clientId = String(body.client ?? "");
  if (!title || !clientId) return Response.json({ error: "Title and client required" }, { status: 400 });

  const client = await Client.findOne({ _id: clientId, owner: s.userId });
  if (!client) return Response.json({ error: "Client not found" }, { status: 404 });

  let projectId: string | null = body.project ?? null;
  if (projectId) {
    const p = await Project.findOne({ _id: projectId, owner: s.userId });
    if (!p) projectId = null;
  }

  const fields = Array.isArray(body.fields) ? body.fields : [];
  const encryptedFields = fields
    .filter((f: { label?: string; value?: string }) => f.label && f.value !== undefined)
    .map((f: { label: string; value: string; isSecret?: boolean }) => ({
      label: f.label,
      value: encrypt(String(f.value)),
      isSecret: f.isSecret !== false,
    }));

  const entry = await Entry.create({
    title,
    type: body.type ?? "other",
    client: clientId,
    project: projectId,
    owner: s.userId,
    fields: encryptedFields,
    tags: Array.isArray(body.tags) ? body.tags : [],
    isPinned: !!body.isPinned,
    environment: body.environment ?? "production",
    notes: body.notes ?? "",
  });

  await logActivity({
    userId: s.userId,
    action: "entry_created",
    entryId: String(entry._id),
    entryTitle: entry.title,
    clientId,
  });

  return Response.json({ id: String(entry._id) }, { status: 201 });
}
