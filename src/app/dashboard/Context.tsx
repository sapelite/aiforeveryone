"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";

type CFile = { name: string; path: string; size: number; modifiedAt: string; type: string };
type Preview = { content: string | null; truncated: boolean; binary: boolean };

const TYPE_LABEL: Record<string, string> = { soul: "Âme · SOUL", user: "Utilisateur · USER", learnings: "Apprentissages", memory: "Mémoire", other: "Autres" };
const ORDER = ["soul", "user", "learnings", "memory", "other"];

export default function Context() {
  const tr = useT();
  const [files, setFiles] = useState<CFile[] | null>(null);
  const [open, setOpen] = useState<CFile | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    fetch("/api/engine/context").then((r) => r.json()).then((j) => setFiles(j.files ?? [])).catch(() => setFiles([]));
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openFile(f: CFile) {
    setOpen(f); setPreview(null);
    fetch(`/api/engine/file?path=${encodeURIComponent("context/" + f.path)}`).then((r) => r.json()).then(setPreview).catch(() => setPreview({ content: null, truncated: false, binary: false }));
  }

  if (files === null) return <p role="status" className="text-base text-[var(--text-muted)]">{tr("context.loadingContext", "chargement du contexte")}<span className="blink">_</span></p>;
  if (files.length === 0) return <div role="status" className="win-flat p-4 text-base text-[var(--text-muted)]">{tr("context.empty", "Aucun fichier de contexte. Le moteur écrit ici son âme (SOUL.md), ses apprentissages et sa mémoire au fil du travail.")}</div>;

  const groups = ORDER.filter((t) => files.some((f) => f.type === t));

  return (
    <div className="space-y-4">
      {groups.map((t) => (
        <section key={t}>
          <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-2">{tr(`context.type.${t}`, TYPE_LABEL[t] ?? t)} · {files.filter((f) => f.type === t).length}</p>
          <div className="win-flat divide-y-2 divide-[var(--border)]">
            {files.filter((f) => f.type === t).map((f) => (
              <button key={f.path} onClick={() => openFile(f)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-card-hover)] transition-colors">
                <PixelIcon name="file" size={12} className="text-[var(--accent)] shrink-0" />
                <span className="flex-1 truncate text-base font-mono">{f.path}</span>
                <span className="text-sm text-[var(--text-muted)] shrink-0">{(f.size / 1024).toFixed(1)} {tr("context.unitKo", "ko")}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(null)}>
          <div className="win-flat w-full max-w-2xl max-h-[80vh] flex flex-col bg-[var(--bg)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between gap-2">
              <span className="truncate font-mono">{open.path}</span>
              <button onClick={() => setOpen(null)} className="win-btn shrink-0" aria-label={tr("context.close", "Fermer")}><PixelIcon name="close" size={11} /></button>
            </div>
            <div className="overflow-auto p-3">
              {preview === null && <p role="status" className="text-sm text-[var(--text-muted)]">{tr("context.loading", "chargement")}<span className="blink">_</span></p>}
              {preview && preview.binary && <p className="text-sm text-[var(--text-muted)]">{tr("context.previewUnavailable", "Aperçu indisponible.")}</p>}
              {preview && !preview.binary && preview.content && <pre className="font-mono text-sm whitespace-pre-wrap leading-snug">{preview.content}{preview.truncated ? tr("context.truncated", "\n…(tronqué)") : ""}</pre>}
              {preview && !preview.binary && !preview.content && <p className="text-sm text-[var(--text-muted)]">{tr("context.emptyFile", "Fichier vide.")}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
