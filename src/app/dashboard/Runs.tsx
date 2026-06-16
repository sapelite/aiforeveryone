"use client";

import { useEffect, useRef, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";

type TaskLite = {
  id: string; title: string; status: string;
  activityLabel?: string | null; costUsd?: number | null; tokensUsed?: number | null;
  errorMessage?: string | null; needsInput?: boolean; model?: string | null;
};
type ApprovalReq = { id: string; toolName: string; title: string; description: string | null };
type Tone = "info" | "ok" | "warn" | "err";
type FeedLine = { id: string; ts: string; type: string; text: string; tone: Tone };

const EVENT_TYPES = [
  "connected", "offline", "task:created", "task:updated", "task:status",
  "task:progress", "task:output", "task:question", "task:log", "task:deleted",
];
const MODELS: [string, string][] = [["auto", "Auto (éco)"], ["sonnet", "Sonnet"], ["haiku", "Haiku (éco)"], ["opus", "Opus (puissant)"]];

let counter = 0;
const uid = () => `f${++counter}`;

export default function Runs() {
  const [goal, setGoal] = useState("");
  const [model, setModel] = useState("auto");
  const [safe, setSafe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [runs, setRuns] = useState<Record<string, TaskLite>>({});
  const [order, setOrder] = useState<string[]>([]);
  const [feed, setFeed] = useState<FeedLine[]>([]);
  const [approvals, setApprovals] = useState<Record<string, ApprovalReq[]>>({});
  const [questions, setQuestions] = useState<Record<string, string>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [mineId, setMineId] = useState<string | null>(null);
  const mine = useRef<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const pushFeed = (type: string, text: string, tone: Tone = "info") => {
    setFeed((f) => [...f.slice(-180), { id: uid(), ts: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }), type, text, tone }]);
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9 }));
  };

  const fetchApprovals = (taskId: string) =>
    fetch(`/api/engine/approvals?taskId=${encodeURIComponent(taskId)}`)
      .then((r) => r.json())
      .then((j) => setApprovals((a) => {
        const list = (j.approvals ?? []) as ApprovalReq[];
        if (list.length === 0) { const { [taskId]: _drop, ...rest } = a; return rest; }
        return { ...a, [taskId]: list };
      }))
      .catch(() => {});

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
        if (t.needsInput) fetchApprovals(t.id);
        else {
          setApprovals((a) => { if (!a[t.id]) return a; const { [t.id]: _d, ...rest } = a; return rest; });
          setQuestions((q) => { if (!q[t.id]) return q; const { [t.id]: _q, ...rest } = q; return rest; });
        }
        const star = t.id === mine.current ? "★ " : "";
        if (type === "task:created") pushFeed(type, `${star}nouvelle tâche : ${t.title}`, "info");
        else if (type === "task:status") pushFeed(type, `${star}${t.title} → ${t.status}`, t.status === "completed" || t.status === "done" ? "ok" : t.status === "failed" || t.status === "error" ? "err" : "info");
        else if (type === "task:question") { if (ev.questionText) setQuestions((q) => ({ ...q, [t.id]: ev.questionText as string })); pushFeed(type, `${star}réponse requise : ${ev.questionText ?? "action en attente"}`, "warn"); }
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
      const res = await fetch("/api/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: g, model, permissionMode: safe ? "default" : "bypassPermissions" }),
      });
      const j = await res.json();
      if (j.ok) { mine.current = j.taskId; setMineId(j.taskId); setGoal(""); pushFeed("run", `but lancé → tâche ${String(j.taskId).slice(0, 8)}${j.routed ? ` · auto → ${j.model}` : ""}`, "ok"); }
      else if (j.offline) pushFeed("run", "moteur hors ligne. démarre le command-centre Agentic OS.", "err");
      else pushFeed("run", `échec : ${j.error ?? "inconnu"}`, "err");
    } catch { pushFeed("run", "erreur réseau.", "err"); }
    finally { setBusy(false); }
  }

  async function decide(taskId: string, requestId: string, decision: "allow_once" | "allow_for_task" | "deny") {
    play(decision === "deny" ? "error" : "success");
    setApprovals((a) => { const list = (a[taskId] ?? []).filter((r) => r.id !== requestId); if (list.length === 0) { const { [taskId]: _d, ...rest } = a; return rest; } return { ...a, [taskId]: list }; });
    await fetch("/api/engine/approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, requestId, decision }) }).catch(() => {});
    pushFeed("approval", `${decision === "deny" ? "refusé" : decision === "allow_for_task" ? "autorisé pour la tâche" : "autorisé une fois"} (${requestId.slice(0, 8)})`, decision === "deny" ? "err" : "ok");
  }

  const tone: Record<Tone, string> = { info: "text-[var(--text-muted)]", ok: "text-[var(--accent)]", warn: "text-[var(--warning)]", err: "text-[var(--destructive)]" };
  const dotFor = (t: TaskLite) =>
    t.needsInput || t.status === "running" ? "bg-[var(--warning)] pulse-dot"
      : t.status === "completed" || t.status === "done" ? "bg-[var(--accent)]"
      : t.status === "failed" || t.status === "error" ? "bg-[var(--destructive)]" : "bg-[var(--text-muted)]";

  async function reply(taskId: string) {
    const msg = (replyText[taskId] ?? "").trim();
    if (!msg) return;
    play("send");
    setReplyText((r) => ({ ...r, [taskId]: "" }));
    await fetch("/api/engine/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, message: msg }) }).catch(() => {});
    pushFeed("reply", `réponse envoyée → ${taskId.slice(0, 8)}`, "ok");
  }

  async function cancel(taskId: string) {
    play("error");
    await fetch("/api/engine/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId }) }).catch(() => {});
    pushFeed("cancel", `arrêt demandé → ${taskId.slice(0, 8)}`, "warn");
  }

  const pendingApprovals = Object.entries(approvals).flatMap(([taskId, list]) => list.map((r) => ({ taskId, ...r })));
  const pendingQuestions = order.filter((id) => runs[id]?.needsInput && !(approvals[id]?.length)).map((id) => ({ taskId: id, question: questions[id] }));

  return (
    <div className="space-y-4">
      <div className="win-flat p-3">
        <p className="font-display text-[9px] uppercase mb-2 flex items-center gap-2"><PixelIcon name="terminal" size={12} /> Lancer un but</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && launch()} placeholder="ex : rédige 3 posts LinkedIn sur notre offre" className="pinput flex-1" />
          <select value={model} onChange={(e) => setModel(e.target.value)} className="modal-input sm:w-44 font-mono">{MODELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <button onClick={launch} disabled={busy || !goal.trim()} data-sfx="send" className="pbtn pbtn-primary pbtn-sm shrink-0"><PixelIcon name="zap" size={12} /> {busy ? "…" : "Exécuter"}</button>
        </div>
        <div className="flex items-center justify-between gap-3 mt-2 flex-wrap">
          <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5">
            <span className={`w-2 h-2 ${online ? "bg-[var(--accent)] pulse-dot" : "bg-[var(--destructive)]"}`} />
            {online === null ? "vérification du moteur…" : online ? "moteur en ligne · exécution headless réelle" : "moteur hors ligne — démarre le command-centre"}
          </p>
          <button onClick={() => setSafe((s) => !s)} className={`pbtn pbtn-sm ${safe ? "" : "pbtn-primary"}`} title="Mode de permission">
            <PixelIcon name={safe ? "shield" : "zap"} size={12} /> {safe ? "Validation requise" : "Mode autonome"}
          </button>
        </div>
      </div>

      {pendingApprovals.length > 0 && (
        <div className="win-flat" style={{ borderColor: "var(--warning)" }}>
          <div className="px-3 py-2 border-b-2 font-display text-[9px] uppercase flex items-center gap-2" style={{ borderColor: "var(--warning)", color: "var(--warning)" }}>
            <PixelIcon name="alert" size={12} /> Validations en attente · {pendingApprovals.length}
          </div>
          <div className="divide-y-2 divide-[var(--border)]">
            {pendingApprovals.map((r) => (
              <div key={r.id} className="p-3 space-y-2">
                <p className="text-base"><span className="font-mono text-[var(--warning)]">{r.toolName}</span> {r.description ? `— ${r.description}` : ""}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => decide(r.taskId, r.id, "allow_once")} className="pbtn pbtn-sm pbtn-primary"><PixelIcon name="check" size={12} /> Autoriser une fois</button>
                  <button onClick={() => decide(r.taskId, r.id, "allow_for_task")} className="pbtn pbtn-sm"><PixelIcon name="check-double" size={12} /> Pour la tâche</button>
                  <button onClick={() => decide(r.taskId, r.id, "deny")} className="pbtn pbtn-sm" style={{ color: "var(--destructive)" }}><PixelIcon name="close" size={12} /> Refuser</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pendingQuestions.length > 0 && (
        <div className="win-flat" style={{ borderColor: "var(--warning)" }}>
          <div className="px-3 py-2 border-b-2 font-display text-[9px] uppercase flex items-center gap-2" style={{ borderColor: "var(--warning)", color: "var(--warning)" }}>
            <PixelIcon name="message-text" size={12} /> Réponses requises · {pendingQuestions.length}
          </div>
          <div className="divide-y-2 divide-[var(--border)]">
            {pendingQuestions.map((q) => (
              <div key={q.taskId} className="p-3 space-y-2">
                <p className="text-base whitespace-pre-wrap">{q.question || "L'agent attend votre réponse."}</p>
                <div className="flex gap-2">
                  <input value={replyText[q.taskId] ?? ""} onChange={(e) => setReplyText((r) => ({ ...r, [q.taskId]: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && reply(q.taskId)} placeholder="Votre réponse…" className="pinput flex-1" />
                  <button onClick={() => reply(q.taskId)} data-sfx="send" className="pbtn pbtn-sm pbtn-primary shrink-0"><PixelIcon name="send" size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.length > 0 && (
        <div className="win-flat">
          <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">Tâches · {order.length}</div>
          <div className="divide-y-2 divide-[var(--border)] max-h-52 overflow-auto">
            {order.map((id) => { const t = runs[id]; if (!t) return null; return (
              <div key={id} className="flex items-center gap-2 px-3 py-2 text-base">
                <span className={`w-2 h-2 shrink-0 ${dotFor(t)}`} />
                <span className="flex-1 truncate">{id === mineId && <span className="text-[var(--accent)]">★ </span>}{t.title}</span>
                {t.costUsd != null && <span className="text-sm text-[var(--text-muted)] font-mono">${t.costUsd.toFixed(3)}</span>}
                <span className={`text-sm font-mono ${t.status === "completed" || t.status === "done" ? "text-[var(--accent)]" : t.status === "failed" || t.status === "error" ? "text-[var(--destructive)]" : "text-[var(--text-muted)]"}`}>{t.needsInput ? "validation" : t.status}</span>
                {t.status === "running" && <button onClick={() => cancel(id)} className="win-btn shrink-0" title="Arrêter la tâche" aria-label="Arrêter"><PixelIcon name="close" size={11} /></button>}
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
