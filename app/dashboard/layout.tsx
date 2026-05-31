import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const clients = await Client.find({ owner: session.user.id }).sort({ name: 1 }).lean();
  const clientList = clients.map((c) => ({
    _id: String(c._id),
    name: c.name,
    slug: c.slug,
    color: c.color,
  }));

  return (
    <div className="flex min-h-screen">
      <Sidebar clients={clientList} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar userName={session.user.name} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
