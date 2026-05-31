"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

export function TagInput({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const [input, setInput] = useState("");

  const add = () => {
    const t = input.trim().toLowerCase();
    if (!t) return;
    if (value.includes(t)) {
      setInput("");
      return;
    }
    onChange([...value, t]);
    setInput("");
  };

  const remove = (t: string) => onChange(value.filter((v) => v !== t));

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    } else if (e.key === "Backspace" && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 bg-[#1a1a1a] border vk-border rounded-lg px-2 py-1.5">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 text-xs bg-white/5 px-2 py-0.5 rounded">
          {t}
          <button type="button" onClick={() => remove(t)}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        className="flex-1 min-w-32 bg-transparent outline-none text-sm py-0.5"
        placeholder="Add tag and Enter"
      />
    </div>
  );
}
