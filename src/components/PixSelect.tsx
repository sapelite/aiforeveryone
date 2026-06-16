"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PixelIcon } from "@/components/PixelIcon";

/**
 * Pixel-styled select whose option list is portaled to <body> with a top
 * z-index, so it is never clipped by a window's overflow or hidden behind
 * another window (native <select> popups misbehave inside webviews).
 *
 * options: array of [value, label].
 */
export function PixSelect({
  value, onChange, options, className = "", title,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  className?: string;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const openMenu = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (r) setRect({ left: r.left, top: r.bottom + 2, width: r.width });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = options.find(([v]) => v === value)?.[1] ?? value;

  return (
    <>
      <button
        type="button"
        ref={btnRef}
        title={title}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`modal-input font-mono flex items-center justify-between gap-2 ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{label}</span>
        <PixelIcon name="chevron-down" size={12} className="shrink-0" />
      </button>
      {open && rect && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div role="listbox" className="fixed z-[9999] win-flat bg-[var(--bg)] max-h-64 overflow-auto" style={{ left: rect.left, top: rect.top, minWidth: rect.width }}>
            {options.map(([v, l]) => (
              <button
                key={v}
                type="button"
                role="option"
                aria-selected={v === value}
                onClick={() => { onChange(v); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm font-mono whitespace-nowrap ${v === value ? "bg-[var(--accent)] text-[#1b1b1b]" : "hover:bg-[var(--bg-card-hover)]"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
