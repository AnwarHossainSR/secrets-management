import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireSession } from "@/lib/session-guard";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  const s = await requireSession();
  if (!s.ok) return s.response;
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const u = await User.findById(s.userId);
  if (!u) return Response.json({ error: "Not found" }, { status: 404 });
  if (body.name) u.name = String(body.name).trim();
  if (body.password) {
    if (String(body.password).length < 8) {
      return Response.json({ error: "Password too short" }, { status: 400 });
    }
    u.password = await bcrypt.hash(String(body.password), 12);
  }
  await u.save();
  return Response.json({ ok: true });
}
