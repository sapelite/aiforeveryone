"use client";

import { useEffect, useRef, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";

type TaskLite = {
  id: string; title: string; status: string;
  activityLabel?: string | null; costUsd?: number | null; tokensUsed?: number | null;
  errorMessage?: string | null; needsInput?: boolean; model?: string | null;
};
type Tone = "info" | "ok" | "warn" | "err";
type FeedLine = { id: string; ts: string; type: string; text: string; tone: Tone };

const EVENT_TYPES = [
  "connected", "offline", "task:created", "task:updated", "task:status",
  "task:progress", "task:output", "task:question", "task:log", "task:deleted",
];
const MODELS: [string, string][] = [["sonnet", "Sonnet (défaut)"], ["haiku", "Haiku (éco)"], ["opus", "Opus (puissant)"]];

let counter = 0;
const uid = () => `f${++counter}`;

export default function Runs() {
  const [goal, setGoal] = useState("");
  const [model, setModel] = useState("sonnet");
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<Record<string, TaskLite>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [feed, setFeed] = useState<FeedLine[]>([]);
  const [mineId, setMineId] = useState<string | null>(null);
  const mine = useRef<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const pushFeed = (type: string, text: string, tone: Tone = "info") => {
    setFeed((f) => [...f.slice(-180), { id: uid(), ts: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type, text, tone }]);
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9 }));
  };

  useEffect(() => {
    let alive = true;
    const check = () => fetch("/api/engine/status").then((r) => r.json()).then((s) => alive && setOnline(!!s.online)).catch(() => alive && setOnline(false));
    check();
    const id = setInterval(check, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/engine/events");
    const handler = (type: string) => (e: MessageEvent) => {
      try {
        if (type === "offline") { setOnline(false); return; }
        if (type === "connected") { setOnline(true); return; }
        const ev = JSON.parse(e.data) as { task?: TaskLite; questionText?: string; logEntry?: { message?: string } };
        const t = ev.task;
        if (!t) return;
        setRuns((r) => ({ ...r, [t.id]: { ...r[t.id], ...t } }));
        setOrder((o) => (o.includes(t.id) ? o : [t.id, ...o].slice(0, 30)));
        const star = t.id === mine.current ? "★ " : "";
        if (type === "task:created") pushFeed(type, `${star}nouvelle tâche : ${t.title}`, "info");
        else if (type === "task:status") pushFeed(type, `${star}${t.title} → ${t.status}`, t.status === "completed" || t.status === "done" ? "ok" : t.status === "failed" || t.status === "error" ? "err" : "info");
        else if (type === "task:question") pushFeed(type, `${star}question : ${ev.questionText ?? "réponse attendue"}`, "warn");
        else if (type === "task:log") pushFeed(type, `${star}${ev.logEntry?.message ?? t.activityLabel ?? "log"}`, "info");
        else if (type === "task:progress") { if (t.activityLabel) pushFeed(type, `${star}${t.activityLabel}`, "info"); }
        else if (type === "task:output") pushFeed(type, `${star}sortie reçue`, "info");
      } catch { /* ignore malformed */ }
    };
    EVENT_TYPES.forEach((ty) => es.addEventListener(ty, handler(ty)));
    es.onerror = () => setOnline(false);
    return () => es.close();
  }, []);

  async function launch() {
    const g = goal.trim();
    if (!g || busy) return;
    setBusy(true); play("send");
    try {
      const res = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: g, model }) });
      const j = await res.json();
      if (j.ok) { mine.current = j.taskId; setMineId(j.taskId); setGoal(""); pushFeed("run", `but lancé → tâche ${String(j.taskId).slice(0, 8)} (${j.title})`, "ok"); }
      else if (j.offline) pushFeed("run", "moteur hors ligne. démarre le command-centre Agentic OS.", "err");
      else pushFeed("run", `échec : ${j.error ?? "inconnu"}`, "err");
    } catch { pushFeed("run", "erreur réseau.", "err"); }
    finally { setBusy(false); }
  }

  const tone: Record<Tone, string> = {
    info: "text-[var(--text-muted)]", ok: "text-[var(--accent)]", warn: "text-[var(--warning)]", err: "text-[var(--destructive)]",
  };
  const dotFor = (t: TaskLite) =>
    t.needsInput || t.status === "running" ? "bg-[var(--warning)] pulse-dot"
      : t.status === "completed" || t.status === "done" ? "bg-[var(--accent)]"
      : t.status === "failed" || t.status === "error" ? "bg-[var(--destructive)]" : "bg-[var(--text-muted)]";

  return (
    <div className="space-y-4">
      <div className="win-flat p-3">
        <p className="font-display text-[9px] uppercase mb-2 flex items-center gap-2"><PixelIcon name="terminal" size={12} /> Lancer un but</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && launch()} placeholder="ex : rédige 3 posts LinkedIn sur notre offre" className="pinput flex-1" />
          <select value={model} onChange={(e) => setModel(e.target.value)} className="modal-input sm:w-44 font-mono">{MODELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <button onClick={launch} disabled={busy || !goal.trim()} data-sfx="send" className="pbtn pbtn-primary pbtn-sm shrink-0"><PixelIcon name="zap" size={12} /> {busy ? "…" : "Exécuter"}</button>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-2 flex items-center gap-1.5">
          <span className={`w-2 h-2 ${online ? "bg-[var(--accent)] pulse-dot" : "bg-[var(--destructive)]"}`} />
          {online === null ? "vérification du moteur…" : online ? "moteur en ligne · exécution réelle headless (claude -p)" : "moteur hors ligne — démarre le command-centre Agentic OS"}
        </p>
      </div>

      {order.length > 0 && (
        <div className="win-flat">
          <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">Tâches · {order.length}</div>
          <div className="divide-y-2 divide-[var(--border)] max-h-52 overflow-auto">
            {order.map((id) => { const t = runs[id]; if (!t) return null; return (
              <div key={id} className="flex items-center gap-2 px-3 py-2 text-base">
                <span className={`w-2 h-2 shrink-0 ${dotFor(t)}`} />
                <span className="flex-1 truncate">{id === mineId && <span className="text-[var(--accent)]">★ </span>}{t.title}</span>
                {t.costUsd != null && <span className="text-sm text-[var(--text-muted)] font-mono">${t.costUsd.toFixed(3)}</span>}
                <span className={`text-sm font-mono ${t.status === "completed" || t.status === "done" ? "text-[var(--accent)]" : t.status === "failed" || t.status === "error" ? "text-[var(--destructive)]" : "text-[var(--text-muted)]"}`}>{t.needsInput ? "question" : t.status}</span>
              </div>
            ); })}
          </div>
        </div>
      )}

      <div className="win-flat">
        <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center gap-2"><PixelIcon name="article" size={12} /> Flux moteur en direct</div>
        <div ref={scroller} className="h-64 overflow-auto p-3 font-mono text-sm space-y-0.5 bg-[var(--bg)]">
          {feed.length === 0 && <p className="text-[var(--text-muted)]">en attente d&apos;activité du moteur<span className="blink">_</span></p>}
          {feed.map((l) => (
            <p key={l.id} className={tone[l.tone]}><span className="text-[var(--text-muted)]">{l.ts} </span><span className="text-[var(--text-muted)]">[{l.type}]</span> {l.text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
