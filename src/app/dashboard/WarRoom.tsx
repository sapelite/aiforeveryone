"use client";

import { useEffect, useRef, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";
import { useT } from "@/lib/i18n";

type Agent = { id: string; name?: string };
type Msg = { id: string; agentId: string; name: string; text: string; color: string; done: boolean };

const PALETTE = ["var(--accent)", "var(--warning)", "#a78bfa", "#22d3ee", "#fb7185", "#34d399", "#fbbf24", "#818cf8"];
const cid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Real ClaudeClaw multi-agent text war room, streamed live into the pixel OS. */
export default function WarRoom() {
  const tr = useT();
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [roster, setRoster] = useState<Agent[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [statusLabel, setStatusLabel] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const colorRef = useRef<Record<string, string>>({});
  const rosterRef = useRef<Agent[]>([]);

  const colorOf = (id: string) => {
    if (!colorRef.current[id]) colorRef.current[id] = PALETTE[Object.keys(colorRef.current).length % PALETTE.length];
    return colorRef.current[id];
  };
  const nameOf = (id: string) => rosterRef.current.find((a) => a.id === id)?.name ?? (id === "user" ? tr("warroom.you", "Vous") : id);
  const scroll = () => requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9 }));

  useEffect(() => { rosterRef.current = roster; }, [roster]);

  useEffect(() => {
    let es: EventSource | null = null;
    let alive = true;
    (async () => {
      const nw = await fetch("/api/claw/warroom/new", { method: "POST" }).then((r) => r.json()).catch(() => null);
      if (!alive) return;
      if (!nw?.meetingId) { setOffline(true); setNotice(tr("warroom.noticeUnreachable", "WarRoom ClaudeClaw injoignable — démarre ClaudeClaw.")); return; }
      const mid = nw.meetingId as string;
      setMeetingId(mid);
      const hist = await fetch(`/api/claw/warroom/history?meetingId=${encodeURIComponent(mid)}`).then((r) => r.json()).catch(() => null);
      if (alive && Array.isArray(hist?.agents)) setRoster(hist.agents as Agent[]);
      es = new EventSource(`/api/claw/warroom/stream?meetingId=${encodeURIComponent(mid)}`);
      es.addEventListener("message", (e) => {
        try { handleEvent((JSON.parse(e.data) as { event: Record<string, unknown> }).event); } catch { /* ignore */ }
      });
      es.addEventListener("offline", () => setNotice(tr("warroom.noticeOffline", "WarRoom ClaudeClaw hors ligne.")));
    })();
    return () => { alive = false; es?.close(); };
  }, []);

  function handleEvent(ev: Record<string, unknown>) {
    const t = ev?.type as string;
    const agentId = ev.agentId as string;
    const turnId = ev.turnId as string;
    if (t === "meeting_state") { if (Array.isArray(ev.agents)) setRoster(ev.agents as Agent[]); return; }
    if (t === "turn_start") { setBusy(true); return; }
    if (t === "agent_selected" || t === "agent_typing") { setStatusLabel(`${nameOf(agentId)} ${tr("warroom.thinking", "réfléchit…")}`); return; }
    if (t === "status_update" && ev.label) { setStatusLabel(String(ev.label)); return; }
    if (t === "agent_chunk" && ev.delta) {
      const key = `${turnId}:${agentId}`;
      const delta = String(ev.delta);
      setMsgs((m) => {
        const i = m.findIndex((x) => x.id === key);
        if (i >= 0) { const c = [...m]; c[i] = { ...c[i], text: c[i].text + delta }; return c; }
        return [...m, { id: key, agentId, name: nameOf(agentId), text: delta, color: colorOf(agentId), done: false }];
      });
      scroll();
      return;
    }
    if (t === "agent_done") { const key = `${turnId}:${agentId}`; setMsgs((m) => m.map((x) => (x.id === key ? { ...x, done: true } : x))); play("receive"); return; }
    if (t === "turn_complete" || t === "turn_aborted") { setBusy(false); setStatusLabel(null); return; }
  }

  async function send() {
    const text = input.trim();
    if (!text || !meetingId || busy) return;
    setInput(""); play("send");
    setMsgs((m) => [...m, { id: cid(), agentId: "user", name: tr("warroom.you", "Vous"), text, color: "var(--accent)", done: true }]);
    scroll();
    const r = await fetch("/api/claw/warroom/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId, text, clientMsgId: cid() }) }).then((res) => res.json()).catch(() => ({ error: tr("warroom.errorNetwork", "réseau") }));
    if (r?.error) setNotice(tr("warroom.noticeSendFailed", "Envoi échoué : ") + r.error);
  }

  async function promote(text: string) {
    setNotice(tr("warroom.noticePromoting", "Promotion en tâche…"));
    const r = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: text.slice(0, 2000), model: "auto" }) }).then((res) => res.json()).catch(() => ({}));
    setNotice(r?.ok ? `${tr("warroom.noticePromotedPrefix", "✅ Promu en tâche (")}${String(r.taskId).slice(0, 8)}${tr("warroom.noticePromotedSuffix", ") — voir Runs.")}` : tr("warroom.noticePromoteFailed", "❌ Échec de la promotion en tâche."));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_190px] gap-3 h-full min-h-[460px]">
      <div className="flex flex-col win-flat">
        <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between">
          <span className="flex items-center gap-2"><PixelIcon name="sword" size={12} /> War Room · ClaudeClaw</span>
          <span className="flex items-center gap-1.5 text-sm">
            <span className={`w-2 h-2 ${meetingId ? "bg-[var(--accent)] pulse-dot" : "bg-[var(--destructive)]"}`} />
            {meetingId ? tr("warroom.statusMeetingOpen", "réunion ouverte") : offline ? tr("warroom.statusOffline", "hors ligne") : "…"}
          </span>
        </div>
        <div ref={scroller} className="flex-1 overflow-y-auto p-3 space-y-2 bg-[var(--bg)]">
          {msgs.length === 0 && <p className="text-sm text-[var(--text-muted)]">{tr("warroom.emptyState", "Lance une discussion : écris une question et les agents (comms / content / ops / research) débattent en direct. Survole une réponse pour la promouvoir en tâche.")}</p>}
          {msgs.map((m) => m.agentId === "user" ? (
            <div key={m.id} className="flex justify-end">
              <p className="max-w-[80%] px-3 py-2 border-2 border-[var(--border)] bg-[var(--accent)] text-[#1b1b1b] text-base leading-snug whitespace-pre-wrap">{m.text}</p>
            </div>
          ) : (
            <div key={m.id} className="group flex gap-2">
              <span className="w-7 h-7 grid place-items-center border-2 border-[var(--border)] shrink-0 text-[10px] font-bold" style={{ background: m.color, color: "#1b1b1b" }}>{m.name.slice(0, 2).toUpperCase()}</span>
              <div className="max-w-[80%]">
                <p className="text-sm" style={{ color: m.color }}>{m.name}{!m.done && <span className="blink"> _</span>}</p>
                <p className="text-base text-[var(--text)] leading-snug whitespace-pre-wrap">{m.text}</p>
                {m.done && m.text.trim().length > 12 && (
                  <button onClick={() => promote(m.text)} className="mt-1 text-sm px-2 py-0.5 border-2 border-[var(--border)] hover:bg-[var(--bg-card-hover)] opacity-0 group-hover:opacity-100 transition-opacity"><PixelIcon name="zap" size={11} className="inline -mt-0.5" /> {tr("warroom.promoteButton", "promouvoir en tâche")}</button>
                )}
              </div>
            </div>
          ))}
          {statusLabel && <p className="text-sm text-[var(--text-muted)] pl-9">{statusLabel}<span className="blink">_</span></p>}
        </div>
        {notice && <p className="px-4 py-2 text-sm text-[var(--warning)] border-t-2 border-[var(--border)] leading-snug">{notice}</p>}
        <div className="border-t-2 border-[var(--border)] p-3 flex items-center gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={tr("warroom.inputPlaceholder", "Lance une question aux agents…")} disabled={!meetingId} className="pinput flex-1" />
          <button onClick={send} disabled={!input.trim() || busy || !meetingId} data-sfx="send" className="pbtn pbtn-sm pbtn-primary shrink-0"><PixelIcon name="send" size={14} /></button>
        </div>
      </div>

      <div className="win-flat p-3 h-fit">
        <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-2">{tr("warroom.roster", "Roster")} · {roster.length}</p>
        <div className="space-y-1.5">
          {roster.length === 0 && <p className="text-sm text-[var(--text-muted)]">{tr("warroom.loading", "chargement")}<span className="blink">_</span></p>}
          {roster.map((a) => (
            <div key={a.id} className="flex items-center gap-2 text-base">
              <span className="w-2.5 h-2.5 shrink-0" style={{ background: colorOf(a.id) }} />
              <span className="truncate">{a.name ?? a.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
