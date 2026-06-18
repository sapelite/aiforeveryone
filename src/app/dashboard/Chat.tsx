"use client";

import { useRef, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";
import { useT } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat({ instanceId, name }: { instanceId: string; name: string }) {
  const tr = useT();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = () => requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9, behavior: "smooth" }));

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    scroll();
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: instanceId, messages: next }),
      });
      const j = await res.json();
      if (j.ok && j.text) {
        setMessages((m) => [...m, { role: "assistant", content: j.text }]);
        play("receive");
      } else if (j.fallback) {
        setNotice(tr("chat.noticeLiveUnavailable", "Chat IA en direct indisponible : connecte-toi à Claude Code (abonnement Max/Pro) sur cette machine, puis relance le serveur."));
        setMessages((m) => [...m, { role: "assistant", content: tr("chat.demoModeMessage", "(Mode démo — session Claude introuvable. Une fois connecté à Claude Code, je réponds en direct en m'appuyant sur la mémoire de l'entreprise.)") }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: tr("chat.errorPrefix", "Erreur : ") + (j.error ?? tr("chat.errorUnknownFem", "inconnue")) }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: tr("chat.networkError", "Erreur réseau.") }]);
    } finally {
      setBusy(false);
      scroll();
    }
  }

  async function launchTask() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true); play("send");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    scroll();
    try {
      const res = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goal: text, model: "auto" }) });
      const j = await res.json();
      if (j.ok) { setMessages((m) => [...m, { role: "assistant", content: `${tr("chat.taskLaunched", "Tâche lancée")} (${String(j.taskId).slice(0, 8)})${j.routed ? ` · ${tr("chat.taskModel", "modèle")} ${j.model}` : ""}. ${tr("chat.taskFollowLive", "Suis-la en direct dans l'onglet Exécutions.")}` }]); play("receive"); }
      else if (j.offline) setNotice(tr("chat.noticeEngineOffline", "Moteur hors ligne : démarre le command-centre pour exécuter des tâches autonomes."));
      else setMessages((m) => [...m, { role: "assistant", content: tr("chat.launchFailed", "Échec du lancement : ") + (j.error ?? tr("chat.errorUnknownMasc", "inconnu")) }]);
    } catch { setMessages((m) => [...m, { role: "assistant", content: tr("chat.networkError", "Erreur réseau.") }]); }
    finally { setBusy(false); scroll(); }
  }

  return (
    <div className="flex flex-col win-flat h-full min-h-[420px]">
      <div ref={scroller} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg)]">
        {messages.length === 0 && (
          <div className="h-full grid place-items-center text-center">
            <div>
              <div className="w-12 h-12 grid place-items-center border-2 border-[var(--border)] bg-[var(--accent)] mx-auto mb-3" style={{ boxShadow: "3px 3px 0 0 var(--border)" }}>
                <PixelIcon name="message-text" size={22} className="text-[#1b1b1b]" />
              </div>
              <p className="mb-1 text-base">{tr("chat.emptyTitle", "Chat avec l'AI OS de")} {name}</p>
              <p className="text-sm text-[var(--text-muted)]">{tr("chat.emptySubtitle", "Pose une question sur l'entreprise, ou lance une tâche autonome.")}</p>
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] px-3 py-2 border-2 border-[var(--border)] bg-[var(--accent)] text-[#1b1b1b] text-base leading-snug">{m.content}</p>
            </div>
          ) : (
            <div key={i} className="flex gap-2">
              <span className="w-7 h-7 grid place-items-center border-2 border-[var(--border)] bg-[var(--bg-card)] shrink-0"><PixelIcon name="command" size={13} className="text-[var(--accent)]" /></span>
              <p className="max-w-[80%] text-base text-[var(--text)] leading-snug whitespace-pre-wrap">{m.content}</p>
            </div>
          )
        )}
        {busy && <p className="text-sm text-[var(--text-muted)] pl-9">{tr("chat.thinking", "réflexion")}<span className="blink">_</span></p>}
      </div>

      {notice && <p className="px-4 py-2 text-sm text-[var(--warning)] border-t-2 border-[var(--border)] leading-snug">{notice}</p>}

      <div className="border-t-2 border-[var(--border)] p-3 flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) send(); }} aria-label={tr("chat.inputLabel", "Message")} placeholder={tr("chat.inputPlaceholder", "Écris ton message…")} className="pinput flex-1" />
        <button onClick={launchTask} disabled={busy || !input.trim()} title={tr("chat.launchTaskTitle", "Lancer comme tâche autonome")} className="pbtn pbtn-sm shrink-0"><PixelIcon name="zap" size={14} /></button>
        <button onClick={send} disabled={busy || !input.trim()} data-sfx="send" title={tr("chat.askTitle", "Demander (réponse rapide)")} className="pbtn pbtn-sm pbtn-primary shrink-0"><PixelIcon name="send" size={14} /></button>
      </div>
    </div>
  );
}
