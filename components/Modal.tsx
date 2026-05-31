"use client";

import { X } from "lucide-react";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="vk-card w-full max-w-md rounded-xl border vk-border shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b vk-border">
          <h3 className="font-medium">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X className="size-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
        {footer && <div className="px-4 py-3 border-t vk-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
