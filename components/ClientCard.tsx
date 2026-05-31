import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

export function ClientCard({
  client,
}: {
  client: {
    _id: string;
    name: string;
    slug: string;
    color: string;
    status: string;
    entryCount?: number;
    projectCount?: number;
  };
}) {
  return (
    <Link
      href={`/dashboard/clients/${client._id}`}
      className="vk-card rounded-xl p-4 block hover:border-neutral-600 transition"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="size-9 rounded-lg grid place-items-center text-xs font-semibold" style={{ background: client.color + "22", color: client.color }}>
            {client.slug}
          </span>
          <div className="min-w-0">
            <p className="font-medium truncate">{client.name}</p>
            <p className="text-xs text-neutral-500">
              {client.entryCount ?? 0} entries · {client.projectCount ?? 0} projects
            </p>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>
    </Link>
  );
}
