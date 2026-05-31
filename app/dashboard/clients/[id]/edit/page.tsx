import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Client } from "@/models/Client";
import { ClientForm } from "../../_form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  await dbConnect();
  const client = await Client.findOne({ _id: id, owner: session!.user.id }).lean();
  if (!client) notFound();
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Edit Client</h1>
      <ClientForm
        initial={{
          _id: String(client._id),
          name: client.name,
          slug: client.slug,
          color: client.color,
          status: client.status,
        }}
      />
    </div>
  );
}
