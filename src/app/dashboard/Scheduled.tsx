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

const DAYS = ["daily", "weekdays", "weekends", "mon,wed,fri"];
const MODELS = ["sonnet", "haiku", "opus"];
const empty = { name: "", time: "09:00", days: "weekdays", model: "sonnet", prompt: "" };

export default function Scheduled() {
  const [jobs, setJobs] = useState<CronJob[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/engine/cron").then((r) => r.json()).then((j) => setJobs(Array.isArray(j.jobs) ? j.jobs : [])).catch(() => setJobs([]));
  }, []);
  useEffect(() => load(), [load]);

  async function act(slug: string, action: "run" | "toggle") {
    setBusy(slug + action); play(action === "run" ? "send" : "toggle");
    try { await fetch("/api/engine/cron", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug, action }) }); }
    finally { setBusy(null); setTimeout(load, 400); }
  }

  async function create() {
    if (!form.name.trim() || !form.prompt.trim()) { setErr("Nom et instruction requis."); return; }
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/engine/cron", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", description: form.name, ...form }) });
      const j = await res.json();
      if (j.ok) { play("success"); setForm(empty); setCreating(false); setTimeout(load, 400); }
      else setErr(j.error ?? "échec");
    } catch { setErr("moteur hors ligne"); }
    finally { setSaving(false); }
  }

  const resultTone = (r?: string) => r === "success" ? "text-[var(--accent)]" : r === "failure" || r === "timeout" ? "text-[var(--destructive)]" : "text-[var(--text-muted)]";

  return (
    <div className="space-y-3">
      {/* creator */}
      <div className="win-flat">
        <button onClick={() => setCreating((c) => !c)} className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-card-hover)]">
          <PixelIcon name={creating ? "close" : "plus"} size={14} className="text-[var(--accent)]" />
          <span className="font-display text-[9px] uppercase flex-1">Nouveau job planifié</span>
        </button>
        {creating && (
          <div className="p-3 border-t-2 border-[var(--border)] space-y-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom (ex : Veille concurrentielle)" className="pinput" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="09:00 / every_2h" className="pinput font-mono" />
              <select value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} className="modal-input">{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
              <select value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="modal-input font-mono">{MODELS.map((m) => <option key={m}>{m}</option>)}</select>
            </div>
            <textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} rows={3} placeholder="Instruction de l'agent (ex : résume les nouveautés du marché et sauve un briefing dans projects/)" className="modal-input resize-none" />
            {err && <p className="text-sm text-[var(--destructive)]">{err}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => { setCreating(false); setErr(null); }} className="pbtn pbtn-sm">Annuler</button>
              <button onClick={create} disabled={saving} className="pbtn pbtn-sm pbtn-primary"><PixelIcon name="check" size={12} /> {saving ? "…" : "Créer"}</button>
            </div>
          </div>
        )}
      </div>

      {jobs === null && <p className="text-base text-[var(--text-muted)]">chargement des jobs<span className="blink">_</span></p>}
      {jobs?.length === 0 && <div className="win-flat p-4 text-base text-[var(--text-muted)]">Aucun job planifié. Crée-en un ci-dessus, ou demande à un agent &laquo; planifie un job qui… &raquo;.</div>}

      {jobs?.map((j) => (
        <div key={j.slug} className={`win-flat p-3 ${j.active ? "" : "opacity-60"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <PixelIcon name="calendar" size={14} className="text-[var(--accent)] shrink-0" />
                <p className="font-mono text-base truncate">{j.name}</p>
                <span className="text-sm border-2 border-[var(--border)] px-1.5">{j.active ? "actif" : "en pause"}</span>
                {j.model && <span className="text-sm text-[var(--text-muted)] font-mono">{j.model}</span>}
              </div>
              {j.description && j.description !== j.name && <p className="text-sm text-[var(--text-muted)] mt-1 leading-snug">{j.description}</p>}
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
