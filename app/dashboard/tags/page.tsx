import Link from "next/link";
import { auth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongodb";
import { Entry } from "@/models/Entry";
import { Types } from "mongoose";

export default async function TagsPage() {
  const session = await auth();
  await dbConnect();
  const ownerId = new Types.ObjectId(session!.user.id);
  const agg = await Entry.aggregate([
    { $match: { owner: ownerId, deletedAt: null } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tags</h1>
      {agg.length === 0 ? (
        <p className="vk-card rounded-xl p-6 text-center text-neutral-500 text-sm">No tags yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {agg.map((t) => (
            <Link
              key={t._id}
              href={`/dashboard/entries?tag=${encodeURIComponent(t._id)}`}
              className="vk-card rounded-lg px-3 py-2 text-sm hover:border-neutral-600 inline-flex items-center gap-2"
            >
              <span>{t._id}</span>
              <span className="text-xs text-neutral-500">{t.count}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
