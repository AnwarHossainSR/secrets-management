"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/Modal";
import toast from "react-hot-toast";

export function ProjectCreate({ clients }: { clients: { _id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [client, setClient] = useState(clients[0]?._id ?? "");
  const [desc, setDesc] = useState("");

  const save = async () => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, client, description: desc }),
    });
    if (!res.ok) {
      toast.error("Failed");
      return;
    }
    toast.success("Created");
    setOpen(false);
    setName("");
    setDesc("");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 vk-accent-bg px-3 py-2 rounded-lg text-sm font-medium"
      >
        <Plus className="size-4" /> New Project
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New Project"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm">
              Cancel
            </button>
            <button onClick={save} className="px-3 py-1.5 text-sm vk-accent-bg rounded-md">
              Create
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm">Client</span>
            <select
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
            >
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
            />
          </label>
          <label className="block">
            <span className="text-sm">Description</span>
            <textarea
              rows={3}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="mt-1 w-full bg-[#1a1a1a] border vk-border rounded-lg px-3 py-2"
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
