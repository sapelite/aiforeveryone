"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { PixSelect } from "@/components/PixSelect";
import { useT } from "@/lib/i18n";
import { useDialogFocus } from "@/lib/useDialogFocus";

type HTask = {
  id: string; title: string; status: string;
  costUsd?: number | null; tokensUsed?: number | null; durationMs?: number | null; model?: string | null;
  completedAt?: string | null; startedAt?: string | null; createdAt?: string | null; errorMessage?: string | null;
};
type Log = { id: string; type: string; content: string; toolName?: string };
type Out = { id: string; fileName: string; relativePath: string; extension: string; sizeBytes: number | null };

function Select({ label, value, set, opts }: { label: string; value: string; set: (v: string) => void; opts: [string, string][] }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <PixSelect value={value} onChange={set} options={opts} />
    </label>
  );
}

export default function History() {
  const tr = useT();
  const STATUS_OPTS: [string, string][] = [["", tr("history.statusAll", "Tout")], ["done", tr("history.statusDone", "Terminées")], ["review", tr("history.statusReview", "En revue")], ["failed", tr("history.statusFailed", "Échouées")]];
  const RANGE_OPTS: [string, string][] = [["", tr("history.rangeAll", "Toujours")], ["today", tr("history.rangeToday", "Aujourd'hui")], ["week", tr("history.rangeWeek", "7 jours")], ["month", tr("history.rangeMonth", "30 jours")], ["90days", tr("history.range90days", "90 jours")]];
  const SORT_OPTS: [string, string][] = [["completedAt", tr("history.sortDate", "Date")], ["costUsd", tr("history.sortCost", "Coût")], ["durationMs", tr("history.sortDuration", "Durée")], ["tokensUsed", tr("history.sortTokens", "Tokens")]];
  const [status, setStatus] = useState("");
  const [range, setRange] = useState("");
  const [sortBy, setSortBy] = useState("completedAt");
  const [data, setData] = useState<{ tasks: HTask[]; total: number } | null>(null);
  const [detail, setDetail] = useState<HTask | null>(null);
  const [detailData, setDetailData] = useState<{ logs: Log[]; outputs: Out[] } | null>(null);
  const detailRef = useDialogFocus<HTMLDivElement>(detail !== null);

  useEffect(() => {
    let alive = true;
    setData(null);
    const qs = new URLSearchParams({ sortBy, sortDir: "desc", limit: "60" });
    if (status) qs.set("status", status);
    if (range) qs.set("dateRange", range);
    fetch(`/api/engine/history?${qs.toString()}`).then((r) => r.json()).then((d) => alive && setData(d)).catch(() => alive && setData({ tasks: [], total: 0 }));
    return () => { alive = false; };
  }, [status, range, sortBy]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  function open(t: HTask) {
    setDetail(t); setDetailData(null);
    fetch(`/api/engine/task?taskId=${encodeURIComponent(t.id)}`).then((r) => r.json()).then(setDetailData).catch(() => setDetailData({ logs: [], outputs: [] }));
  }

  const fmtDur = (ms?: number | null) => ms ? (ms >= 60000 ? `${Math.round(ms / 60000)}min` : `${Math.round(ms / 1000)}s`) : null;
  const fmtDate = (s?: string | null) => s ? new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";
  const dot = (t: HTask) => t.errorMessage ? "bg-[var(--destructive)]" : (t.status === "done" || t.status === "completed") ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Select label={tr("history.labelStatus", "État")} value={status} set={setStatus} opts={STATUS_OPTS} />
        <Select label={tr("history.labelRange", "Période")} value={range} set={setRange} opts={RANGE_OPTS} />
        <Select label={tr("history.labelSort", "Tri")} value={sortBy} set={setSortBy} opts={SORT_OPTS} />
      </div>

      {data === null && <p role="status" className="text-base text-[var(--text-muted)]">{tr("history.loading", "chargement de l'historique")}<span className="blink">_</span></p>}
      {data && data.tasks.length === 0 && <div role="status" className="win-flat p-4 text-base text-[var(--text-muted)]">{tr("history.empty", "Aucune tâche dans l'historique pour ces filtres.")}</div>}
      {data && data.tasks.length > 0 && (
        <div className="win-flat">
          <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">{data.tasks.length} {tr("history.countSeparator", "sur")} {data.total}</div>
          <div className="divide-y-2 divide-[var(--border)] max-h-[58vh] overflow-auto">
            {data.tasks.map((t) => (
              <button key={t.id} onClick={() => open(t)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-base hover:bg-[var(--bg-card-hover)] transition-colors">
                <span className={`w-2 h-2 shrink-0 ${dot(t)}`} />
                <span className="flex-1 truncate">{t.title}</span>
                {t.model && <span className="hidden sm:inline text-sm text-[var(--text-muted)] font-mono">{t.model}</span>}
                {fmtDur(t.durationMs) && <span className="hidden md:inline text-sm text-[var(--text-muted)] font-mono">{fmtDur(t.durationMs)}</span>}
                {t.costUsd != null && t.costUsd > 0 && <span className="text-sm text-[var(--text-muted)] font-mono">${t.costUsd.toFixed(3)}</span>}
                <span className="hidden sm:inline text-sm text-[var(--text-muted)] font-mono">{fmtDate(t.completedAt ?? t.startedAt ?? t.createdAt)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDetail(null)}>
          <div ref={detailRef} role="dialog" aria-modal="true" aria-label={detail.title} tabIndex={-1} className="win-flat w-full max-w-2xl max-h-[80vh] flex flex-col bg-[var(--bg)] outline-none" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between gap-2">
              <span className="truncate">{detail.title}</span>
              <button onClick={() => setDetail(null)} className="win-btn shrink-0" aria-label={tr("history.closeAria", "Fermer")}><PixelIcon name="close" size={11} /></button>
            </div>
            <div className="overflow-auto p-3 space-y-3">
              {detail.errorMessage && <p className="text-sm text-[var(--destructive)] font-mono whitespace-pre-wrap">{detail.errorMessage}</p>}
              {detailData === null && <p role="status" className="text-sm text-[var(--text-muted)]">{tr("history.detailLoading", "chargement")}<span className="blink">_</span></p>}
              {detailData && detailData.outputs.length > 0 && (
                <div>
                  <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-1.5">{tr("history.outputsTitle", "Fichiers produits")} · {detailData.outputs.length}</p>
                  <div className="space-y-1">
                    {detailData.outputs.map((o) => (
                      <a key={o.id} href={`/api/engine/download?path=${encodeURIComponent(o.relativePath)}`} className="flex items-center gap-2 text-sm font-mono hover:text-[var(--accent)]">
                        <PixelIcon name="file" size={12} className="text-[var(--accent)]" />
                        <span className="flex-1 truncate" title={o.relativePath}>{o.relativePath}</span>
                        {o.sizeBytes != null && <span className="text-[var(--text-muted)] shrink-0">{(o.sizeBytes / 1024).toFixed(1)} {tr("history.unitKilobytes", "ko")}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {detailData && (
                <div>
                  <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-1.5">{tr("history.logTitle", "Journal")}</p>
                  <div className="space-y-1.5 font-mono text-sm">
                    {detailData.logs.filter((l) => (l.content && l.content.trim()) || l.toolName).length === 0 && <p className="text-[var(--text-muted)]">{tr("history.logEmpty", "aucune sortie enregistrée.")}</p>}
                    {detailData.logs.map((l) => l.type === "tool_use"
                      ? <p key={l.id} className="text-[var(--text-muted)]">→ {l.toolName ?? tr("history.toolFallback", "outil")}</p>
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
