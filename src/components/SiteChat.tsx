"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";

type Cta = { label: string; href: string };
type Msg = { role: "user" | "assistant"; content: string; cta?: Cta };

const SUGGESTIONS = ["Comment ça marche ?", "Vos tarifs", "C'est quoi le Brain ?", "Quelles intégrations ?"];

const NAV: { label: string; href: string; icon: string }[] = [
  { label: "Accueil", href: "/", icon: "home" },
  { label: "Fonctionnalités", href: "/#features", icon: "sparkle" },
  { label: "Comment ça marche", href: "/#how", icon: "list-box" },
  { label: "Tarifs", href: "/#pricing", icon: "coin" },
  { label: "Voir la démo", href: "/dashboard", icon: "dashboard" },
  { label: "Audit gratuit", href: "/onboarding", icon: "zap" },
];

/* Selon le sujet, propose un bouton qui mène droit au bon endroit. */
function ctaFor(text: string): Cta | null {
  const m = text.toLowerCase();
  if (/(brain|obsidian|vault|m[ée]moire|connaissance|cerveau|notes?)/.test(m)) return { label: "Ouvrir le Brain", href: "/dashboard?view=brain" };
  if (/(int[ée]grat|mcp|connect|brancher|slack|drive|sheets|notion|hubspot|stripe|github|outil)/.test(m)) return { label: "Voir les intégrations", href: "/dashboard?view=integrations" };
  if (/(tarif|prix|co[uû]t|abonnement|formule|combien|budget|forfait)/.test(m)) return { label: "Voir les tarifs", href: "/#pricing" };
  if (/(agent|war ?room|standup|console|planifi|workflow|t[âa]che)/.test(m)) return { label: "Ouvrir la démo", href: "/dashboard" };
  if (/(audit|gratuit|commencer|d[ée]marrer|essai|contact|rendez|devis|inscri)/.test(m)) return { label: "Lancer l'audit gratuit", href: "/onboarding" };
  if (/(comment|marche|fonctionne|[ée]tape|process|d[ée]roul|semaine|d[ée]lai)/.test(m)) return { label: "Comment ça marche", href: "/#how" };
  if (/(fonctionnalit|capacit|que fait|sait faire|feature)/.test(m)) return { label: "Voir les fonctionnalités", href: "/#features" };
  return null;
}

function MenuPanel({ onGo, onAsk }: { onGo: (href: string) => void; onAsk: (q: string) => void }) {
  return (
    <>
      <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-2">Naviguer</p>
      <div className="space-y-1.5">
        {NAV.map((n) => (
          <button key={n.href} onClick={() => onGo(n.href)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 border-2 border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent)] hover:text-[#1b1b1b] transition-colors text-left">
            <PixelIcon name={n.icon} size={18} />
            <span className="flex-1 text-base">{n.label}</span>
            <PixelIcon name="chevron-right" size={14} />
          </button>
        ))}
      </div>
      <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mt-4 mb-2">Questions fréquentes</p>
      <div className="grid grid-cols-2 gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => onAsk(s)}
            className="text-left text-sm px-2 py-1.5 border-2 border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors">{s}</button>
        ))}
      </div>
    </>
  );
}

export default function SiteChat() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = () => requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9, behavior: "smooth" }));

  function go(href: string) {
    setMenuOpen(false);
    setOpen(false);
    if (href.startsWith("/#") && typeof window !== "undefined" && window.location.pathname === "/") {
      document.getElementById(href.slice(2))?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push(href);
  }

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || busy) return;
    setMenuOpen(false);
    const cta = ctaFor(content);
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next); setInput(""); setBusy(true); scroll();
    try {
      const r = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const j = await r.json();
      setMessages((m) => [...m, { role: "assistant", content: j.text ?? "…", cta: cta ?? undefined }]);
      play("receive");
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Désolé, une erreur est survenue. Réessayez ?" }]);
    } finally { setBusy(false); scroll(); }
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label="Assistant Clio"
        className="fixed bottom-5 right-5 z-[60] w-13 h-13 grid place-items-center border-2 border-[var(--border)] text-[#1b1b1b] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        style={{ width: 52, height: 52, background: "var(--accent)", boxShadow: "4px 4px 0 0 var(--border)" }}>
        <PixelIcon name={open ? "close" : "message-text"} size={24} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[min(92vw,380px)] h-[min(72vh,560px)] flex flex-col win animate-fade-in-up">
          <div className="win-title">
            <span className="flex items-center gap-1.5"><PixelIcon name="robot-face-happy" size={12} /> CLIO.EXE</span>
            <span className="flex items-center gap-1">
              <button onClick={() => setMenuOpen((v) => !v)} className="win-btn" aria-label="Menu"><PixelIcon name={menuOpen ? "close" : "menu"} size={11} /></button>
              <button onClick={() => setOpen(false)} className="win-btn" aria-label="Fermer">x</button>
            </span>
          </div>

          <div className="px-3 py-2 border-b-2 border-[var(--border)] flex items-center gap-2 bg-[var(--bg-card)]">
            <span className="w-2 h-2 bg-[var(--accent)] pulse-dot" />
            <span className="text-sm text-[var(--text-muted)]">Clio · assistante · en ligne</span>
          </div>

          <div ref={scroller} className="flex-1 overflow-y-auto p-3 space-y-2.5 relative bg-[var(--bg)]">
            {messages.length === 0 && (
              <div>
                <div className="win-flat p-3 mb-3">
                  <p className="text-base leading-snug">Bonjour. Je suis Clio. Choisis une rubrique pour naviguer, ou pose ta question.</p>
                </div>
                <MenuPanel onGo={go} onAsk={send} />
              </div>
            )}
            {messages.map((m, i) => m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] text-base px-3 py-1.5 border-2 border-[var(--border)] text-[#1b1b1b]" style={{ background: "var(--accent)" }}>{m.content}</p>
              </div>
            ) : (
              <div key={i} className="flex flex-col items-start gap-2">
                <p className="max-w-[88%] text-base px-3 py-1.5 win-flat whitespace-pre-wrap leading-snug">{m.content}</p>
                {m.cta && (
                  <button onClick={() => go(m.cta!.href)} className="pbtn pbtn-primary pbtn-sm">
                    {m.cta.label} <PixelIcon name="arrow-right" size={12} />
                  </button>
                )}
              </div>
            ))}
            {busy && <p className="text-sm text-[var(--text-muted)] pl-1">Clio écrit<span className="blink">_</span></p>}

            {menuOpen && messages.length > 0 && (
              <div className="absolute inset-0 bg-[var(--bg)] p-3 overflow-y-auto">
                <MenuPanel onGo={go} onAsk={send} />
              </div>
            )}
          </div>

          <div className="p-2.5 border-t-2 border-[var(--border)] flex items-center gap-2 bg-[var(--bg-card)]">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Écris ton message…"
              className="pinput flex-1" />
            <button onClick={() => send()} disabled={busy || !input.trim()} data-sfx="send" className="pbtn pbtn-primary pbtn-sm shrink-0" aria-label="Envoyer">
              <PixelIcon name="send" size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
