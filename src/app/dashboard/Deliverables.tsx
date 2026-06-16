"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type Project = { slug: string; name: string; status: string; goal: string | null; taskCount: number; doneCount: number; createdAt: string };
type RFile = { id: string; fileName: string; relativePath: string; extension: string; sizeBytes: number | null; createdAt: string; taskTitle?: string };
type Preview = { content: string | null; truncated: boolean; extension: string; binary: boolean };

export default function Deliverables() {
  const [data, setData] = useState<{ projects: Project[]; files: RFile[] } | null>(null);
  const [open, setOpen] = useState<RFile | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    fetch("/api/engine/projects").then((r) => r.json()).then(setData).catch(() => setData({ projects: [], files: [] }));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function openFile(f: RFile) {
    setOpen(f); setPreview(null);
    fetch(`/api/engine/file?path=${encodeURIComponent(f.relativePath)}`).then((r) => r.json()).then(setPreview).catch(() => setPreview({ content: null, truncated: false, extension: f.extension, binary: false }));
  }

  if (data === null) return <p role="status" className="text-base text-[var(--text-muted)]">chargement des livrables<span className="blink">_</span></p>;

  if (data.projects.length === 0 && data.files.length === 0)
    return <div role="status" className="win-flat p-4 text-base text-[var(--text-muted)]">Aucun livrable pour l&apos;instant. Lance un but dans <span className="text-[var(--text)]">Exécutions</span> — les fichiers produits par les agents apparaîtront ici.</div>;

  return (
    <div className="space-y-4">
      {data.projects.length > 0 && (
        <section>
          <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-2">Projets · {data.projects.length}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.projects.map((p) => { const pct = p.taskCount ? Math.round((p.doneCount / p.taskCount) * 100) : 0; return (
              <div key={p.slug} className="win-flat p-3">
                <div className="flex items-center gap-2 mb-1">
                  <PixelIcon name="folder" size={14} className="text-[var(--accent)] shrink-0" />
                  <p className="font-mono text-base truncate flex-1">{p.name}</p>
                  <span className="text-sm text-[var(--text-muted)]">{p.status}</span>
                </div>
                {p.goal && <p className="text-sm text-[var(--text-muted)] leading-snug line-clamp-2 mb-2">{p.goal}</p>}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 border-2 border-[var(--border)] bg-[var(--bg)]"><div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} /></div>
                  <span className="text-sm font-mono text-[var(--text-muted)]">{p.doneCount}/{p.taskCount}</span>
                </div>
              </div>
            ); })}
          </div>
        </section>
      )}

      {data.files.length > 0 && (
        <section>
          <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-2">Fichiers récents · {data.files.length}</p>
          <div className="win-flat divide-y-2 divide-[var(--border)]">
            {data.files.map((f) => (
              <button key={f.id} onClick={() => openFile(f)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-card-hover)] transition-colors">
                <PixelIcon name="file" size={12} className="text-[var(--accent)] shrink-0" />
                <span className="flex-1 truncate text-base" title={f.relativePath}>{f.relativePath}</span>
                {f.sizeBytes != null && <span className="text-sm text-[var(--text-muted)] shrink-0">{(f.sizeBytes / 1024).toFixed(1)} ko</span>}
              </button>
            ))}
          </div>
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(null)}>
          <div className="win-flat w-full max-w-2xl max-h-[80vh] flex flex-col bg-[var(--bg)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between gap-2">
              <span className="truncate">{open.fileName}</span>
              <span className="flex items-center gap-1 shrink-0">
                <a href={`/api/engine/download?path=${encodeURIComponent(open.relativePath)}`} className="win-btn" title="Télécharger" aria-label="Télécharger"><PixelIcon name="download" size={11} /></a>
                <button onClick={() => setOpen(null)} className="win-btn" aria-label="Fermer"><PixelIcon name="close" size={11} /></button>
              </span>
            </div>
            <div className="overflow-auto p-3">
              {preview === null && <p className="text-sm text-[var(--text-muted)]">chargement<span className="blink">_</span></p>}
              {preview && preview.binary && <p className="text-sm text-[var(--text-muted)]">Fichier binaire (.{open.extension}) — <a href={`/api/engine/download?path=${encodeURIComponent(open.relativePath)}`} className="text-[var(--accent)] underline">télécharger</a> pour l&apos;ouvrir.</p>}
              {preview && !preview.binary && preview.content && <pre className="font-mono text-sm whitespace-pre-wrap leading-snug">{preview.content}{preview.truncated ? "\n…(tronqué)" : ""}</pre>}
              {preview && !preview.binary && !preview.content && <p className="text-sm text-[var(--text-muted)]">Aperçu indisponible.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
