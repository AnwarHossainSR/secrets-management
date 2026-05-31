"use client";

import { Plus, Trash2, EyeOff, Eye } from "lucide-react";

export type FieldInput = { label: string; value: string; isSecret: boolean };

export function DynamicFieldBuilder({
  value,
  onChange,
}: {
  value: FieldInput[];
  onChange: (next: FieldInput[]) => void;
}) {
  const update = (i: number, patch: Partial<FieldInput>) =>
    onChange(value.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { label: "", value: "", isSecret: true }]);

  return (
    <div className="space-y-2">
      {value.map((f, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <input
            placeholder="Label"
            value={f.label}
            onChange={(e) => update(i, { label: e.target.value })}
            className="col-span-4 bg-[#11141c] border vk-border rounded px-2 py-1.5 text-sm"
          />
          <input
            placeholder="Value"
            type={f.isSecret ? "password" : "text"}
            value={f.value}
            onChange={(e) => update(i, { value: e.target.value })}
            className="col-span-6 bg-[#11141c] border vk-border rounded px-2 py-1.5 text-sm vk-mono"
          />
          <button
            type="button"
            onClick={() => update(i, { isSecret: !f.isSecret })}
            className="col-span-1 p-2 hover:bg-white/5 rounded"
            title={f.isSecret ? "Make plain" : "Make secret"}
          >
            {f.isSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
          <button
            type="button"
            onClick={() => remove(i)}
            className="col-span-1 p-2 hover:bg-red-500/10 text-red-400 rounded"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm vk-accent hover:underline"
      >
        <Plus className="size-4" /> Add field
      </button>
    </div>
  );
}
