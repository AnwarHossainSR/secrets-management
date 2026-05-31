"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pin, Trash2, Download } from "lucide-react";
import { Modal } from "@/components/Modal";
import toast from "react-hot-toast";

export function EntryActions({ id, isPinned }: { id: string; isPinned: boolean }) {
  const router = useRouter();
  const [pinned, setPinned] = useState(isPinned);
  const [confirm, setConfirm] = useState(false);

  const togglePin = async () => {
    const res = await fetch(`/api/entries/${id}/pin`, { method: "PATCH" });
    if (!res.ok) { toast.error("Failed"); return; }
    const j = await res.json();
    setPinned(j.isPinned);
    router.refresh();
  };

  const remove = async () => {
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Failed"); return; }
    toast.success("Moved to trash");
    router.push("/dashboard/entries");
    router.refresh();
  };

  const downloadEnv = () => {
    window.location.href = `/api/entries/${id}/export-env`;
  };

  return (
    <>
      <button
        onClick={downloadEnv}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm hover:bg-[var(--card-inner)]"
        style={{ border: "1px solid var(--border)", color: "var(--text)" }}
        title="Download as .env file"
      >
        <Download className="size-4" />
        <span className="hidden sm:inline">Download .env</span>
      </button>
      <button
        onClick={togglePin}
        className="p-2 rounded-md hover:bg-[var(--card-inner)]"
        style={{ border: "1px solid var(--border)", color: pinned ? "var(--amber)" : "var(--text-muted)" }}
        title={pinned ? "Unpin" : "Pin"}
      >
        <Pin className="size-4" />
      </button>
      <button
        onClick={() => setConfirm(true)}
        className="p-2 rounded-md hover:bg-[var(--badge-prod-bg)]"
        style={{ border: "1px solid var(--border)", color: "var(--badge-prod-text)" }}
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
            <button onClick={() => setConfirm(false)} className="px-3 py-1.5 text-sm vk-muted">
              Cancel
            </button>
            <button
              onClick={remove}
              className="px-3 py-1.5 text-sm rounded-md"
              style={{ background: "var(--badge-prod-bg)", color: "var(--badge-prod-text)" }}
            >
              Move to trash
            </button>
          </>
        }
      >
        <p className="text-sm vk-muted">
          The entry will be moved to trash and can be restored later.
        </p>
      </Modal>
    </>
  );
}
