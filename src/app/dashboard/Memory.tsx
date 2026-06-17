"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";

type Doc = { name: string; path: string; content: string; updatedAt: string | null };
const LABEL: Record<string, string> = {
  "MEMORY.md": "Mémoire de travail (cap 2500)",
  "learnings.md": "Apprentissages (self-improvement)",
  "SOUL.md": "Identité (SOUL)",
};

export default function Memory() {
  const tr = useT();
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/engine/memory").then((r) => r.json()).then((j) => {
      const d = (j.docs ?? []) as Doc[];
      setDocs(d); setOpen(d[0]?.path ?? null);
    }).catch(() => setDocs([]));
  }, []);

  if (docs === null) return <p className="text-base text-[var(--text-muted)]">{tr("memory.loading", "lecture de la mémoire du moteur")}<span className="blink">_</span></p>;
  if (docs.length === 0) return <div className="win-flat p-4 text-base text-[var(--text-muted)]">{tr("memory.emptyPrefix", "Mémoire vide ou moteur hors ligne. Elle vit dans ")}<span className="font-mono">context/</span>{tr("memory.emptySuffix", " du workspace (MEMORY.md, memory/, learnings.md).")}</div>;

  const label = (d: Doc) => LABEL[d.name] ?? (d.path.startsWith("context/memory/") ? `${tr("memory.journalPrefix", "Journal · ")}${d.name.replace(/\.md$/, "")}` : d.name);

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--text-muted)]">{tr("memory.intro", "Mémoire vivante du moteur. Elle s'enrichit à chaque session (wrap-up), nourrit les agents, et reste réversible via git.")}</p>
      {docs.map((d) => (
        <div key={d.path} className="win-flat">
          <button onClick={() => setOpen((o) => (o === d.path ? null : d.path))} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-card-hover)]">
            <PixelIcon name={open === d.path ? "chevron-down" : "chevron-right"} size={14} />
            <span className="font-display text-[9px] uppercase flex-1 truncate">{label(d)}</span>
            <span className="text-sm text-[var(--text-muted)] font-mono">{d.content.length} c</span>
          </button>
          {open === d.path && <pre className="px-3 pb-3 pt-2 text-sm font-mono whitespace-pre-wrap leading-snug max-h-80 overflow-auto border-t-2 border-[var(--border)]">{d.content || tr("memory.empty", "(vide)")}</pre>}
        </div>
      ))}
    </div>
  );
}
