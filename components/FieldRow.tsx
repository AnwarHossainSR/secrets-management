"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export function FieldRow({
  entryId,
  fieldIndex,
  label,
  isSecret,
  preview,
}: {
  entryId: string;
  fieldIndex: number;
  label: string;
  isSecret: boolean;
  preview?: string;
}) {
  const [value, setValue] = useState<string | null>(isSecret ? null : preview ?? "");
  const [revealed, setRevealed] = useState(!isSecret);
  const [copied, setCopied] = useState(false);

  const reveal = async () => {
    if (value !== null) {
      setRevealed((v) => !v);
      return;
    }
    const res = await fetch(`/api/entries/${entryId}/reveal/${fieldIndex}`);
    if (!res.ok) {
      toast.error("Failed to reveal");
      return;
    }
    const data = await res.json();
    setValue(data.value);
    setRevealed(true);
  };

  const copy = async () => {
    let v = value;
    if (v === null) {
      const res = await fetch(`/api/entries/${entryId}/reveal/${fieldIndex}`);
      if (!res.ok) return;
      const data = await res.json();
      v = data.value;
      setValue(v);
    }
    await navigator.clipboard.writeText(v ?? "");
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="vk-card rounded-lg p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="vk-mono text-sm truncate">
          {revealed && value !== null ? value : "••••••••••••"}
        </p>
      </div>
      {isSecret && (
        <button onClick={reveal} className="p-2 hover:bg-white/5 rounded-md" title="Reveal">
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
      <button onClick={copy} className="p-2 hover:bg-white/5 rounded-md" title="Copy">
        {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
