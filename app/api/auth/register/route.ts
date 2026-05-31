import { dbConnect } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const allow = process.env.ALLOW_REGISTRATION !== "false";
  const body = await req.json().catch(() => ({}));
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").toLowerCase().trim();
  const password = String(body.password ?? "");

  if (!name || !email || password.length < 8) {
    return Response.json({ error: "Invalid input. Password >= 8 chars." }, { status: 400 });
  }

  if (!allow) {
    return Response.json({ error: "Registration is disabled" }, { status: 403 });
  }

  await dbConnect();
  const existing = await User.findOne({ email });
  if (existing) return Response.json({ error: "Email already in use" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashed });
  return Response.json({ id: String(user._id), email: user.email }, { status: 201 });
}
