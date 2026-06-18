"use client";

import { useEffect, useRef, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";
import { useT } from "@/lib/i18n";

type Msg = { id: string; role: "user" | "assistant" | "system"; content: string; url?: string; ts: number };

let counter = 0;
const uid = () => `m${++counter}`;

const EVENTS = ["user_message", "assistant_message", "assistant_photo", "processing", "progress", "error"];

/** ClaudeClaw channels (Telegram/WhatsApp/Slack) surfaced live inside the pixel OS. */
export default function Inbox() {
  const tr = useT();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [status, setStatus] = useState<{ online: boolean; telegramConnected?: boolean } | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const sending = useRef(false);

  const scroll = () => requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9 }));

  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/claw/status").then((r) => r.json()).then((s) => alive && setStatus(s)).catch(() => alive && setStatus({ online: false }));
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    fetch("/api/claw/history?limit=40")
      .then((r) => r.json())
      .then((j) => {
        const turns = (j.turns ?? []) as { id: number; role: string; content: string; created_at: number }[];
        setMsgs([...turns].reverse().map((t) => ({ id: uid(), role: t.role === "user" ? "user" : "assistant", content: t.content, ts: t.created_at })));
        scroll();
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/claw/events");
    const handler = (type: string) => (e: MessageEvent) => {
      try {
        const ev = JSON.parse(e.data) as { content?: string; url?: string; caption?: string; processing?: boolean; timestamp?: number; description?: string; source?: string };
        const ts = ev.timestamp ?? Date.now();
        // Only echo INCOMING user messages (Telegram/WhatsApp). Messages we sent from
        // here are already shown optimistically, so skip the dashboard-sourced echo.
        if (type === "user_message" && ev.content && ev.source !== "dashboard") { setMsgs((m) => [...m, { id: uid(), role: "user", content: ev.content!, ts }]); }
        else if (type === "assistant_message" && ev.content) { setMsgs((m) => [...m, { id: uid(), role: "assistant", content: ev.content!, ts }]); setProgressLabel(null); play("receive"); }
        else if (type === "assistant_photo") { setMsgs((m) => [...m, { id: uid(), role: "assistant", content: ev.caption ?? "", url: ev.url, ts }]); }
        else if (type === "processing") { setBusy(!!ev.processing); if (!ev.processing) setProgressLabel(null); }
        else if (type === "progress" && ev.description) { setProgressLabel(ev.description!); }
        else if (type === "error" && ev.content) { setMsgs((m) => [...m, { id: uid(), role: "system", content: "⚠ " + ev.content, ts }]); }
        scroll();
      } catch { /* ignore */ }
    };
    EVENTS.forEach((t) => es.addEventListener(t, handler(t)));
    return () => es.close();
  }, []);

  async function send() {
    const t = input.trim();
    // Synchronous ref lock: blocks held-Enter / key-repeat / double-tap before
    // any React commit or the SSE "processing" echo flips `busy`.
    if (!t || busy || sending.current) return;
    sending.current = true;
    setInput(""); play("send");
    setMsgs((m) => [...m, { id: uid(), role: "user", content: t, ts: Date.now() }]);
    scroll();
    try {
      const r = await fetch("/api/claw/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: t }) }).then((res) => res.json()).catch(() => ({ ok: false, error: tr("inbox.errorNetwork", "réseau") }));
      if (!r.ok) setMsgs((m) => [...m, { id: uid(), role: "system", content: "⚠ " + tr("inbox.sendFailed", "envoi échoué : ") + (r.error ?? ""), ts: Date.now() }]);
    } finally {
      sending.current = false;
    }
  }

  return (
    <div className="flex flex-col win-flat h-full min-h-[460px]">
      <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between">
        <span className="flex items-center gap-2"><PixelIcon name="inbox" size={12} /> Inbox · ClaudeClaw</span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className={`w-2 h-2 ${status?.online ? "bg-[var(--accent)] pulse-dot" : "bg-[var(--destructive)]"}`} />
          {status === null ? "…" : status.online ? (status.telegramConnected ? tr("inbox.statusTelegramConnected", "Telegram connecté") : tr("inbox.statusOnline", "en ligne")) : tr("inbox.statusOffline", "hors ligne")}
        </span>
      </div>
      <div ref={scroller} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto p-3 space-y-2 bg-[var(--bg)]">
        {msgs.length === 0 && <p className="text-sm text-[var(--text-muted)]">{tr("inbox.empty", "Aucun message. Écris depuis Telegram ou ici — tout arrive aux deux endroits.")}</p>}
        {msgs.map((m) => m.role === "user" ? (
          <div key={m.id} className="flex justify-end">
            <p className="max-w-[80%] px-3 py-2 border-2 border-[var(--border)] bg-[var(--accent)] text-[#1b1b1b] text-base leading-snug whitespace-pre-wrap">{m.content}</p>
          </div>
        ) : m.role === "system" ? (
          <p key={m.id} className="text-sm text-[var(--text-muted)] font-mono px-1">{m.content}</p>
        ) : (
          <div key={m.id} className="flex gap-2">
            <span className="w-7 h-7 grid place-items-center border-2 border-[var(--border)] bg-[var(--bg-card)] shrink-0"><PixelIcon name="command" size={13} className="text-[var(--accent)]" /></span>
            <div className="max-w-[80%]">
              {m.content && <p className="text-base text-[var(--text)] leading-snug whitespace-pre-wrap">{m.content}</p>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {m.url && <img src={m.url} alt={m.content.trim() || tr("inbox.imageAlt", "Image envoyée par l'assistant")} referrerPolicy="no-referrer" className="mt-1 max-w-full border-2 border-[var(--border)]" />}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-[var(--text-muted)] pl-9">{progressLabel ?? tr("inbox.thinking", "ClaudeClaw réfléchit")}<span className="blink">_</span></p>}
      </div>
      <div className="border-t-2 border-[var(--border)] p-3 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} disabled={!status?.online} aria-label={tr("inbox.inputLabel", "Message à ClaudeClaw")} placeholder={status !== null && !status.online ? tr("inbox.placeholderOffline", "ClaudeClaw hors ligne…") : tr("inbox.placeholder", "Écris à ClaudeClaw (arrive aussi sur Telegram)…")} className="pinput flex-1" />
        <button onClick={send} disabled={!input.trim() || busy || !status?.online} data-sfx="send" className="pbtn pbtn-sm pbtn-primary shrink-0"><PixelIcon name="send" size={14} /></button>
      </div>
    </div>
  );
}
