import Link from "next/link";
import { TypeBadge } from "./TypeBadge";
import { ClientPill } from "./ClientPill";
import { Pin } from "lucide-react";

export function EntryCard({
  entry,
}: {
  entry: {
    _id: string;
    title: string;
    type: string;
    isPinned?: boolean;
    client?: { _id: string; name: string; slug: string; color: string } | null;
    updatedAt?: string;
  };
}) {
  return (
    <Link
      href={`/dashboard/entries/${entry._id}`}
      className="vk-card rounded-xl p-4 block hover:border-neutral-600 transition"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium truncate">{entry.title}</h3>
        {entry.isPinned && <Pin className="size-4 vk-accent shrink-0" />}
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <TypeBadge type={entry.type} />
        {entry.client && <ClientPill slug={entry.client.slug} color={entry.client.color} name={entry.client.name} />}
      </div>
    </Link>
  );
}
