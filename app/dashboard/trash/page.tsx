import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { TrashRow } from "./_row";

export default async function TrashPage() {
  const session = await auth();
  await dbConnect();
  const items = await Entry.find({ owner: session!.user.id, deletedAt: { $ne: null } })
    .populate("client", "name slug color")
    .sort({ deletedAt: -1 })
    .lean();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Trash</h1>
      <p className="text-sm text-neutral-400">Deleted entries can be restored or purged.</p>
      <div className="vk-card rounded-xl divide-y divide-[#222222]">
        {items.length === 0 && (
          <p className="text-sm text-neutral-500 p-6 text-center">Trash is empty.</p>
        )}
        {items.map((e) => (
          <TrashRow
            key={String(e._id)}
            id={String(e._id)}
            title={e.title}
            deletedAt={e.deletedAt!.toISOString()}
            clientName={(e.client as { name?: string } | null)?.name ?? ""}
          />
        ))}
      </div>
    </div>
  );
}
