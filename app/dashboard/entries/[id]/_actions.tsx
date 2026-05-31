"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, Trash2 } from "lucide-react";
import { Modal } from "@/components/Modal";
import toast from "react-hot-toast";

export function EntryActions({ id, isPinned }: { id: string; isPinned: boolean }) {
  const router = useRouter();
  const [pinned, setPinned] = useState(isPinned);
  const [confirm, setConfirm] = useState(false);

  const togglePin = async () => {
    const res = await fetch(`/api/entries/${id}/pin`, { method: "PATCH" });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    const j = await res.json();
    setPinned(j.isPinned);
    router.refresh();
  };

  const remove = async () => {
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success("Moved to trash");
    router.push("/dashboard/entries");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={togglePin}
        className={`p-2 rounded-lg border vk-border hover:bg-white/5 ${pinned ? "vk-accent" : ""}`}
        title={pinned ? "Unpin" : "Pin"}
      >
        <Pin className="size-4" />
      </button>
      <button
        onClick={() => setConfirm(true)}
        className="p-2 rounded-lg border vk-border hover:bg-red-500/10 text-red-400"
        title="Delete"
      >
        <Trash2 className="size-4" />
      </button>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Move to trash?"
        footer={
          <>
            <button onClick={() => setConfirm(false)} className="px-3 py-1.5 text-sm">
              Cancel
            </button>
            <button onClick={remove} className="px-3 py-1.5 text-sm bg-red-500/20 text-red-300 rounded-md">
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-neutral-300">
          The entry will be moved to trash and can be restored later.
        </p>
      </Modal>
    </>
  );
}
