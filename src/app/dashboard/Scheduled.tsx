"use client";

import { useCallback, useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";

type CronJob = {
  name: string; slug: string; description?: string; time: string; days: string;
  active: boolean; model?: string; nextRun?: string | null;
  lastRun?: { result?: string; lastRun?: string } | null;
  stats?: { totalRuns?: number; avgCostUsd?: number } | null;
};

export default function Scheduled() {
  const [jobs, setJobs] = useState<CronJob[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/engine/cron").then((r) => r.json()).then((j) => setJobs(Array.isArray(j.jobs) ? j.jobs : [])).catch(() => setJobs([]));
  }, []);
  useEffect(() => load(), [load]);

  async function act(slug: string, action: "run" | "toggle") {
    setBusy(slug + action); play(action === "run" ? "send" : "toggle");
    try { await fetch("/api/engine/cron", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, action }) }); }
    finally { setBusy(null); setTimeout(load, 400); }
  }

  if (jobs === null) return <p className="text-base text-[var(--text-muted)]">chargement des jobs planifiés<span className="blink">_</span></p>;
  if (jobs.length === 0)
    return <div className="win-flat p-4 text-base text-[var(--text-muted)]">Aucun job planifié. Demande à un agent &laquo; planifie un job qui… &raquo; (skill <span className="font-mono">ops-cron</span>), ou ajoute un <span className="font-mono">.md</span> dans <span className="font-mono">cron/jobs/</span> du workspace.</div>;

  const resultTone = (r?: string) => r === "success" ? "text-[var(--accent)]" : r === "failure" || r === "timeout" ? "text-[var(--destructive)]" : "text-[var(--text-muted)]";

  return (
    <div className="space-y-3">
      {jobs.map((j) => (
        <div key={j.slug} className={`win-flat p-3 ${j.active ? "" : "opacity-60"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <PixelIcon name="calendar" size={14} className="text-[var(--accent)] shrink-0" />
                <p className="font-mono text-base truncate">{j.name}</p>
                <span className="text-sm border-2 border-[var(--border)] px-1.5">{j.active ? "actif" : "en pause"}</span>
                {j.model && <span className="text-sm text-[var(--text-muted)] font-mono">{j.model}</span>}
              </div>
              {j.description && <p className="text-sm text-[var(--text-muted)] mt-1 leading-snug">{j.description}</p>}
              <p className="text-sm text-[var(--text-muted)] font-mono mt-1.5">
                <PixelIcon name="clock" size={12} className="inline -mt-0.5" /> {j.time} · {j.days}
                {j.nextRun && <span> · suivant : {j.nextRun}</span>}
              </p>
              <p className="text-sm mt-0.5">
                {j.lastRun?.result && <span className={`font-mono ${resultTone(j.lastRun.result)}`}>dernier : {j.lastRun.result}</span>}
                {j.stats?.totalRuns != null && <span className="text-[var(--text-muted)] font-mono"> · {j.stats.totalRuns} runs</span>}
                {j.stats?.avgCostUsd != null && j.stats.avgCostUsd > 0 && <span className="text-[var(--text-muted)] font-mono"> · ~${j.stats.avgCostUsd.toFixed(3)}/run</span>}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button onClick={() => act(j.slug, "run")} disabled={busy === j.slug + "run"} className="pbtn pbtn-sm pbtn-primary"><PixelIcon name="zap" size={12} /> Lancer</button>
              <button onClick={() => act(j.slug, "toggle")} disabled={busy === j.slug + "toggle"} className="pbtn pbtn-sm"><PixelIcon name={j.active ? "pause" : "play"} size={12} /> {j.active ? "Pause" : "Activer"}</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
