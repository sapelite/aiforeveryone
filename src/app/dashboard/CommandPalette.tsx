"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";

export type PaletteItem = {
  id: string;
  label: string;
  section: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  run: () => void;
};

export default function CommandPalette({
  open, onClose, items,
}: { open: boolean; onClose: () => void; items: PaletteItem[] }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((i) => (i.label + " " + i.section + " " + (i.hint ?? "")).toLowerCase().includes(s));
  }, [q, items]);

  useEffect(() => { setIdx(0); }, [q]);
  useEffect(() => {
    if (open) { setQ(""); setIdx(0); requestAnimationFrame(() => inputRef.current?.focus()); }
  }, [open]);

  if (!open) return null;

  const choose = (i: number) => { const it = filtered[i]; if (it) { it.run(); onClose(); } };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#101218] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 h-13 border-b border-white/[0.06] py-3">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, filtered.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter") { e.preventDefault(); choose(idx); }
              else if (e.key === "Escape") { onClose(); }
            }}
            placeholder="Aller à… ou exécuter une action"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-600"
          />
          <kbd className="text-[10px] text-zinc-600 border border-white/[0.08] rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && <p className="px-4 py-6 text-sm text-zinc-600 text-center">Aucun résultat.</p>}
          {filtered.map((it, i) => {
            const active = i === idx;
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onMouseEnter={() => setIdx(i)}
                onClick={() => choose(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left ${active ? "acc-bg-soft" : ""}`}
              >
                {Icon && <Icon className={`w-4 h-4 ${active ? "acc-text" : "text-zinc-500"}`} />}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${active ? "text-white" : "text-zinc-300"}`}>{it.label}</p>
                  {it.hint && <p className="text-xs text-zinc-600 truncate">{it.hint}</p>}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-600">{it.section}</span>
                {active && <CornerDownLeft className="w-3.5 h-3.5 text-zinc-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
