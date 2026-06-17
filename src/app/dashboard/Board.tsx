"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";

type BTask = {
  id: string; title: string; status: string; needsInput?: boolean | number;
  costUsd?: number | null; model?: string | null; errorMessage?: string | null; updatedAt?: string;
};
type Log = { id: string; type: string; content: string; toolName?: string };
type Out = { id: string; fileName: string; relativePath: string; extension: string; sizeBytes: number | null };

const COLUMNS: { key: string; tKey: string; label: string; icon: string }[] = [
  { key: "queue", tKey: "colQueue", label: "En file", icon: "inbox" },
  { key: "running", tKey: "colRunning", label: "En cours", icon: "zap" },
  { key: "review", tKey: "colReview", label: "À valider", icon: "alert" },
  { key: "done", tKey: "colDone", label: "Terminé", icon: "check" },
];

function colOf(t: BTask): string {
  if (t.needsInput || t.status === "review") return "review";
  if (t.status === "running") return "running";
  if (t.status === "done" || t.status === "completed") return "done";
  return "queue";
}

export default function Board() {
  const tr = useT();
  const [tasks, setTasks] = useState<BTask[] | null>(null);
  const [detail, setDetail] = useState<BTask | null>(null);
  const [detailData, setDetailData] = useState<{ logs: Log[]; outputs: Out[] } | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/engine/tasks").then((r) => r.json())
      .then((j) => alive && setTasks((Array.isArray(j) ? j : j.tasks ?? []) as BTask[]))
      .catch(() => alive && setTasks([]));
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  function open(t: BTask) {
    setDetail(t); setDetailData(null);
    fetch(`/api/engine/task?taskId=${encodeURIComponent(t.id)}`).then((r) => r.json()).then(setDetailData).catch(() => setDetailData({ logs: [], outputs: [] }));
  }

  const dot = (t: BTask) => t.errorMessage ? "bg-[var(--destructive)]"
    : t.needsInput || t.status === "running" ? "bg-[var(--warning)] pulse-dot"
      : t.status === "done" || t.status === "completed" ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]";

  if (tasks === null) return <p role="status" className="text-base text-[var(--text-muted)]">{tr("board.loadingBoard", "chargement du tableau")}<span className="blink">_</span></p>;
  if (tasks.length === 0) return <div role="status" className="win-flat p-4 text-base text-[var(--text-muted)]">{tr("board.emptyPrefix", "Aucune tâche. Lance un but depuis")} <span className="text-[var(--text)]">{tr("board.runsLink", "Runs")}</span> {tr("board.emptySuffix", "et il apparaîtra ici, rangé par colonne.")}</div>;

  const byCol = (key: string) => tasks.filter((t) => colOf(t) === key).sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {COLUMNS.map((c) => {
        const items = byCol(c.key);
        return (
          <div key={c.key} className="win-flat flex flex-col min-h-[12rem]">
            <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center gap-2">
              <PixelIcon name={c.icon} size={12} /> {tr(`board.${c.tKey}`, c.label)} <span className="text-[var(--text-muted)]">· {items.length}</span>
            </div>
            <div className="p-2 space-y-2 overflow-auto max-h-[64vh]">
              {items.length === 0 && <p className="text-sm text-[var(--text-muted)] px-1 py-2">{tr("board.columnEmpty", "vide")}</p>}
              {items.map((t) => (
                <button key={t.id} onClick={() => open(t)} className="w-full text-left win-flat p-2 hover:bg-[var(--bg-card-hover)] transition-colors">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 shrink-0 ${dot(t)}`} />
                    <span className="text-sm truncate flex-1">{t.title}</span>
                  </div>
                  {(t.model || (t.costUsd != null && t.costUsd > 0)) && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-muted)] font-mono pl-3.5">
                      {t.model && <span>{t.model}</span>}
                      {t.costUsd != null && t.costUsd > 0 && <span>${t.costUsd.toFixed(3)}</span>}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {detail && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div className="win-flat w-full max-w-2xl max-h-[80vh] flex flex-col bg-[var(--bg)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between gap-2">
              <span className="truncate">{detail.title}</span>
              <button onClick={() => setDetail(null)} className="win-btn shrink-0" aria-label={tr("board.close", "Fermer")}><PixelIcon name="close" size={11} /></button>
            </div>
            <div className="overflow-auto p-3 space-y-3">
              {detail.errorMessage && <p className="text-sm text-[var(--destructive)] font-mono whitespace-pre-wrap">{detail.errorMessage}</p>}
              {detailData === null && <p role="status" className="text-sm text-[var(--text-muted)]">{tr("board.loading", "chargement")}<span className="blink">_</span></p>}
              {detailData && detailData.outputs.length > 0 && (
                <div>
                  <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-1.5">{tr("board.producedFiles", "Fichiers produits")} · {detailData.outputs.length}</p>
                  <div className="space-y-1">
                    {detailData.outputs.map((o) => (
                      <a key={o.id} href={`/api/engine/download?path=${encodeURIComponent(o.relativePath)}`} className="flex items-center gap-2 text-sm font-mono hover:text-[var(--accent)]">
                        <PixelIcon name="file" size={12} className="text-[var(--accent)]" />
                        <span className="flex-1 truncate" title={o.relativePath}>{o.relativePath}</span>
                        {o.sizeBytes != null && <span className="text-[var(--text-muted)] shrink-0">{(o.sizeBytes / 1024).toFixed(1)} {tr("board.kilobytes", "ko")}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {detailData && (
                <div>
                  <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-1.5">{tr("board.journal", "Journal")}</p>
                  <div className="space-y-1.5 font-mono text-sm">
                    {detailData.logs.filter((l) => (l.content && l.content.trim()) || l.toolName).length === 0 && <p className="text-[var(--text-muted)]">{tr("board.noOutput", "aucune sortie enregistrée.")}</p>}
                    {detailData.logs.map((l) => l.type === "tool_use"
                      ? <p key={l.id} className="text-[var(--text-muted)]">→ {l.toolName ?? tr("board.tool", "outil")}</p>
                      : (l.content && l.content.trim() ? <p key={l.id} className="whitespace-pre-wrap leading-snug">{l.content}</p> : null))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
