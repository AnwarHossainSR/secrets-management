import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Client } from "@/models/Client";
import { encrypt } from "@/lib/encryption";
import { requireSession } from "@/lib/session-guard";
import { logActivity } from "@/lib/activity";
import { parseEnv } from "@/lib/env-parser";

export async function POST(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;

  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const clientId = String(body.client ?? "");
  const content = String(body.content ?? "");
  const environment = (body.environment ?? "production") as
    | "production" | "staging" | "development" | "other";
  const project: string | null = body.project ?? null;
  const tags: string[] = Array.isArray(body.tags) ? body.tags : [];

  if (!title || !clientId || !content) {
    return Response.json({ error: "title, client, and content required" }, { status: 400 });
  }

  await dbConnect();
  const c = await Client.findOne({ _id: clientId, owner: s.userId });
  if (!c) return Response.json({ error: "Client not found" }, { status: 404 });

  const pairs = parseEnv(content);
  if (pairs.length === 0) return Response.json({ error: "No KEY=VALUE pairs found" }, { status: 400 });

  const entry = await Entry.create({
    title,
    type: "api",
    client: clientId,
    project,
    owner: s.userId,
    environment,
    tags,
    fields: pairs.map((p) => ({ label: p.key, value: encrypt(p.value), isSecret: true })),
    notes: `Imported ${pairs.length} variables from .env`,
  });

  await logActivity({
    userId: s.userId,
    action: "env_imported",
    entryId: String(entry._id),
    entryTitle: title,
    clientId,
  });

  return Response.json({ id: String(entry._id), count: pairs.length }, { status: 201 });
}
