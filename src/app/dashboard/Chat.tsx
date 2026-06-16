"use client";

import { useRef, useState } from "react";
import { Send, Bot, Sparkles } from "lucide-react";
import { play } from "@/lib/sound";

type Msg = { role: "user" | "assistant"; content: string };

export default function Chat({ instanceId, name }: { instanceId: string; name: string }) {
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
        setNotice("Chat IA en direct indisponible : connecte-toi à Claude Code (abonnement Max/Pro) sur cette machine, puis relance le serveur.");
        setMessages((m) => [...m, { role: "assistant", content: "(Mode démo — session Claude introuvable. Une fois connecté à Claude Code, je réponds en direct en m'appuyant sur la mémoire de l'entreprise.)" }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: "Erreur : " + (j.error ?? "inconnue") }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Erreur réseau." }]);
    } finally {
      setBusy(false);
      scroll();
    }
  }

  return (
    <div className="flex flex-col border-2 border-[var(--border)] bg-[var(--bg-card)] h-full min-h-[420px]">
      <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full grid place-items-center text-center text-sm text-[var(--text-muted)]">
            <div>
              <div className="w-12 h-12 rounded-2xl acc-grad-br grid place-items-center mx-auto mb-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <p className="mb-1 text-[var(--text-muted)]">Chat avec l&apos;AI OS de {name}</p>
              <p className="text-xs">Pose une question sur l&apos;entreprise, ses clients, ses priorités…</p>
            </div>
          </div>
        )}
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] px-3.5 py-2 rounded-2xl acc-bg text-white text-sm">{m.content}</p>
            </div>
          ) : (
            <div key={i} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--bg-card)] border-2 border-[var(--border)] grid place-items-center shrink-0">
                <Bot className="w-3.5 h-3.5 acc-text" />
              </div>
              <p className="max-w-[80%] text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap">{m.content}</p>
            </div>
          )
        )}
        {busy && <p className="text-xs text-[var(--text-muted)] italic pl-10">réflexion…</p>}
      </div>

      {notice && <p className="px-4 py-2 text-xs text-amber-400/80 border-t-2 border-[var(--border)]">{notice}</p>}

      <div className="border-t-2 border-[var(--border)] p-3 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Écris ton message…"
          className="flex-1 bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg px-3 h-9 text-sm placeholder:text-[var(--text-muted)] outline-none acc-ring"
        />
        <button onClick={send} disabled={busy || !input.trim()} data-sfx="send" className="w-9 h-9 grid place-items-center rounded-lg acc-bg disabled:opacity-40 text-white">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
