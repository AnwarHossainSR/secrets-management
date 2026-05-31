import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { encrypt } from "@/lib/encryption";
import { requireSession } from "@/lib/session-guard";
import { logActivity } from "@/lib/activity";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const entry = await Entry.findOne({ _id: id, owner: s.userId })
    .populate({ path: "client", select: "name slug color status" })
    .populate({ path: "project", select: "name" })
    .lean();
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });

  await Entry.updateOne({ _id: id }, { $set: { lastViewedAt: new Date() } });
  await logActivity({
    userId: s.userId,
    action: "entry_viewed",
    entryId: id,
    entryTitle: entry.title,
    clientId: entry.client && String((entry.client as { _id: unknown })._id),
  });

  return Response.json({
    entry: {
      ...entry,
      _id: String(entry._id),
      client: entry.client && { ...entry.client, _id: String((entry.client as { _id: unknown })._id) },
      project: entry.project && { ...entry.project, _id: String((entry.project as { _id: unknown })._id) },
      fields: (entry.fields ?? []).map((f) => ({ label: f.label, isSecret: f.isSecret })),
    },
  });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();

  const existing = await Entry.findOne({ _id: id, owner: s.userId });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (body.title !== undefined) existing.title = String(body.title);
  if (body.type) existing.type = body.type;
  if (body.client) existing.client = body.client;
  if (body.project !== undefined) existing.project = body.project || null;
  if (body.tags) existing.tags = body.tags;
  if (body.isPinned !== undefined) existing.isPinned = !!body.isPinned;
  if (body.environment) existing.environment = body.environment;
  if (body.notes !== undefined) existing.notes = body.notes;

  if (Array.isArray(body.fields)) {
    existing.fields = body.fields
      .filter((f: { label?: string; value?: string }) => f.label && f.value !== undefined)
      .map((f: { label: string; value: string; isSecret?: boolean }) => ({
        label: f.label,
        value: encrypt(String(f.value)),
        isSecret: f.isSecret !== false,
      }));
  }

  await existing.save();
  await logActivity({
    userId: s.userId,
    action: "entry_updated",
    entryId: id,
    entryTitle: existing.title,
    clientId: String(existing.client),
  });
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  const { id } = await ctx.params;
  await dbConnect();
  const entry = await Entry.findOne({ _id: id, owner: s.userId });
  if (!entry) return Response.json({ error: "Not found" }, { status: 404 });
  if (entry.deletedAt) {
    await Entry.deleteOne({ _id: id });
    await logActivity({ userId: s.userId, action: "entry_purged", entryTitle: entry.title });
  } else {
    entry.deletedAt = new Date();
    await entry.save();
    await logActivity({
      userId: s.userId,
      action: "entry_trashed",
      entryId: id,
      entryTitle: entry.title,
      clientId: String(entry.client),
    });
  }
  return Response.json({ ok: true });
}
