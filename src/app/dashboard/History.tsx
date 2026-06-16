"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { PixSelect } from "@/components/PixSelect";

type HTask = {
  id: string; title: string; status: string;
  costUsd?: number | null; tokensUsed?: number | null; durationMs?: number | null; model?: string | null;
  completedAt?: string | null; startedAt?: string | null; createdAt?: string | null; errorMessage?: string | null;
};
type Log = { id: string; type: string; content: string; toolName?: string };
type Out = { id: string; fileName: string; relativePath: string; extension: string; sizeBytes: number | null };

const STATUS: [string, string][] = [["", "Tout"], ["done", "Terminées"], ["review", "En revue"], ["failed", "Échouées"]];
const RANGE: [string, string][] = [["", "Toujours"], ["today", "Aujourd'hui"], ["week", "7 jours"], ["month", "30 jours"], ["90days", "90 jours"]];
const SORT: [string, string][] = [["completedAt", "Date"], ["costUsd", "Coût"], ["durationMs", "Durée"], ["tokensUsed", "Tokens"]];

function Select({ label, value, set, opts }: { label: string; value: string; set: (v: string) => void; opts: [string, string][] }) {
  return (
    <label className="flex items-center gap-1.5 text-sm">
      <span className="text-[var(--text-muted)]">{label}</span>
      <PixSelect value={value} onChange={set} options={opts} />
    </label>
  );
}

export default function History() {
  const [status, setStatus] = useState("");
  const [range, setRange] = useState("");
  const [sortBy, setSortBy] = useState("completedAt");
  const [data, setData] = useState<{ tasks: HTask[]; total: number } | null>(null);
  const [detail, setDetail] = useState<HTask | null>(null);
  const [detailData, setDetailData] = useState<{ logs: Log[]; outputs: Out[] } | null>(null);

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
  const dot = (t: HTask) => t.errorMessage ? "bg-[var(--destructive)]" : t.status === "done" ? "bg-[var(--accent)]" : "bg-[var(--text-muted)]";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Select label="État" value={status} set={setStatus} opts={STATUS} />
        <Select label="Période" value={range} set={setRange} opts={RANGE} />
        <Select label="Tri" value={sortBy} set={setSortBy} opts={SORT} />
      </div>

      {data === null && <p role="status" className="text-base text-[var(--text-muted)]">chargement de l&apos;historique<span className="blink">_</span></p>}
      {data && data.tasks.length === 0 && <div role="status" className="win-flat p-4 text-base text-[var(--text-muted)]">Aucune tâche dans l&apos;historique pour ces filtres.</div>}
      {data && data.tasks.length > 0 && (
        <div className="win-flat">
          <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">{data.tasks.length} sur {data.total}</div>
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
          <div className="win-flat w-full max-w-2xl max-h-[80vh] flex flex-col bg-[var(--bg)]" onClick={(e) => e.stopPropagation()}>
            <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between gap-2">
              <span className="truncate">{detail.title}</span>
              <button onClick={() => setDetail(null)} className="win-btn shrink-0" aria-label="Fermer"><PixelIcon name="close" size={11} /></button>
            </div>
            <div className="overflow-auto p-3 space-y-3">
              {detail.errorMessage && <p className="text-sm text-[var(--destructive)] font-mono whitespace-pre-wrap">{detail.errorMessage}</p>}
              {detailData === null && <p role="status" className="text-sm text-[var(--text-muted)]">chargement<span className="blink">_</span></p>}
              {detailData && detailData.outputs.length > 0 && (
                <div>
                  <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-1.5">Fichiers produits · {detailData.outputs.length}</p>
                  <div className="space-y-1">
                    {detailData.outputs.map((o) => (
                      <a key={o.id} href={`/api/engine/download?path=${encodeURIComponent(o.relativePath)}`} className="flex items-center gap-2 text-sm font-mono hover:text-[var(--accent)]">
                        <PixelIcon name="file" size={12} className="text-[var(--accent)]" />
                        <span className="flex-1 truncate" title={o.relativePath}>{o.relativePath}</span>
                        {o.sizeBytes != null && <span className="text-[var(--text-muted)] shrink-0">{(o.sizeBytes / 1024).toFixed(1)} ko</span>}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {detailData && (
                <div>
                  <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-1.5">Journal</p>
                  <div className="space-y-1.5 font-mono text-sm">
                    {detailData.logs.filter((l) => (l.content && l.content.trim()) || l.toolName).length === 0 && <p className="text-[var(--text-muted)]">aucune sortie enregistrée.</p>}
                    {detailData.logs.map((l) => l.type === "tool_use"
                      ? <p key={l.id} className="text-[var(--text-muted)]">→ {l.toolName ?? "outil"}</p>
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
