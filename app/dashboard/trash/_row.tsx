"use client";

import { useRouter } from "next/navigation";
import { RotateCcw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function TrashRow({
  id,
  title,
  deletedAt,
  clientName,
}: {
  id: string;
  title: string;
  deletedAt: string;
  clientName: string;
}) {
  const router = useRouter();

  const restore = async () => {
    const res = await fetch(`/api/trash/${id}/restore`, { method: "POST" });
    if (!res.ok) {
      toast.error("Restore failed");
      return;
    }
    toast.success("Restored");
    router.refresh();
  };

  const purge = async () => {
    if (!confirm("Permanently delete? Cannot be undone.")) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success("Purged");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{title}</p>
        <p className="text-xs text-neutral-500">
          {clientName} · deleted {new Date(deletedAt).toLocaleString()}
        </p>
      </div>
      <button
        onClick={restore}
        className="p-2 hover:bg-white/5 rounded-md border vk-border"
        title="Restore"
      >
        <RotateCcw className="size-4" />
      </button>
      <button
        onClick={purge}
        className="p-2 hover:bg-red-500/10 text-red-400 rounded-md border vk-border"
        title="Purge"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
