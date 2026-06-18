"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";
import { useT } from "@/lib/i18n";

type Cta = { key: string; label: string; href: string };
type Msg = { role: "user" | "assistant"; content: string; cta?: Cta };

const SUGGESTIONS: { key: string; label: string }[] = [
  { key: "how", label: "Comment ça marche ?" },
  { key: "pricing", label: "Vos tarifs" },
  { key: "brain", label: "C'est quoi le Brain ?" },
  { key: "integrations", label: "Quelles intégrations ?" },
];

const NAV: { key: string; label: string; href: string; icon: string }[] = [
  { key: "home", label: "Accueil", href: "/", icon: "home" },
  { key: "features", label: "Fonctionnalités", href: "/#features", icon: "sparkle" },
  { key: "how", label: "Comment ça marche", href: "/#how", icon: "list-box" },
  { key: "pricing", label: "Tarifs", href: "/#pricing", icon: "coin" },
  { key: "demo", label: "Voir la démo", href: "/dashboard", icon: "dashboard" },
  { key: "audit", label: "Audit gratuit", href: "/onboarding", icon: "zap" },
];

/* Selon le sujet, propose un bouton qui mène droit au bon endroit. Le label FR
   sert de fallback; la traduction se fait au rendu via sitechat.cta.<key>. */
function ctaFor(text: string): Cta | null {
  const m = text.toLowerCase();
  if (/(brain|obsidian|vault|m[ée]moire|connaissance|cerveau|notes?)/.test(m)) return { key: "brain", label: "Ouvrir le Brain", href: "/dashboard?view=brain" };
  if (/(int[ée]grat|mcp|connect|brancher|slack|drive|sheets|notion|hubspot|stripe|github|outil)/.test(m)) return { key: "integrations", label: "Voir les intégrations", href: "/dashboard?view=integrations" };
  if (/(tarif|prix|co[uû]t|abonnement|formule|combien|budget|forfait)/.test(m)) return { key: "pricing", label: "Voir les tarifs", href: "/#pricing" };
  if (/(agent|war ?room|standup|console|planifi|workflow|t[âa]che)/.test(m)) return { key: "demo", label: "Ouvrir la démo", href: "/dashboard" };
  if (/(audit|gratuit|commencer|d[ée]marrer|essai|contact|rendez|devis|inscri)/.test(m)) return { key: "audit", label: "Lancer l'audit gratuit", href: "/onboarding" };
  if (/(comment|marche|fonctionne|[ée]tape|process|d[ée]roul|semaine|d[ée]lai)/.test(m)) return { key: "how", label: "Comment ça marche", href: "/#how" };
  if (/(fonctionnalit|capacit|que fait|sait faire|feature)/.test(m)) return { key: "features", label: "Voir les fonctionnalités", href: "/#features" };
  return null;
}

function MenuPanel({ onGo, onAsk }: { onGo: (href: string) => void; onAsk: (q: string) => void }) {
  const tr = useT();
  return (
    <>
      <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mb-2">{tr("sitechat.sectionNavigate", "Naviguer")}</p>
      <div className="space-y-1.5">
        {NAV.map((n) => (
          <button key={n.href} onClick={() => onGo(n.href)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 border-2 border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--accent)] hover:text-[#1b1b1b] transition-colors text-left">
            <PixelIcon name={n.icon} size={18} />
            <span className="flex-1 text-base">{tr(`sitechat.nav.${n.key}`, n.label)}</span>
            <PixelIcon name="chevron-right" size={14} />
          </button>
        ))}
      </div>
      <p className="font-display text-[8px] uppercase text-[var(--text-muted)] mt-4 mb-2">{tr("sitechat.sectionFaq", "Questions fréquentes")}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button key={s.key} onClick={() => onAsk(s.label)}
            className="text-left text-sm px-2 py-1.5 border-2 border-[var(--border)] hover:bg-[var(--bg-card-hover)] transition-colors">{tr(`sitechat.faq.${s.key}`, s.label)}</button>
        ))}
      </div>
    </>
  );
}

export default function SiteChat() {
  const tr = useT();
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
      setMessages((m) => [...m, { role: "assistant", content: tr("sitechat.errorMessage", "Désolé, une erreur est survenue. Réessayez ?") }]);
    } finally { setBusy(false); scroll(); }
  }

  return (
    <>
      <button onClick={() => setOpen((o) => !o)} aria-label={tr("sitechat.toggleAria", "Assistant Clio")}
        className="fixed bottom-5 right-5 z-[60] w-13 h-13 grid place-items-center border-2 border-[var(--border)] text-[#1b1b1b] transition-transform hover:-translate-y-0.5 active:translate-y-0"
        style={{ width: 52, height: 52, background: "var(--accent)", boxShadow: "4px 4px 0 0 var(--border)" }}>
        <PixelIcon name={open ? "close" : "message-text"} size={24} />
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[60] w-[min(92vw,380px)] h-[min(72vh,560px)] flex flex-col win animate-fade-in-up">
          <div className="win-title">
            <span className="flex items-center gap-1.5"><PixelIcon name="robot-face-happy" size={12} /> CLIO.EXE</span>
            <span className="flex items-center gap-1">
              <button onClick={() => setMenuOpen((v) => !v)} className="win-btn" aria-label={tr("sitechat.menuAria", "Menu")}><PixelIcon name={menuOpen ? "close" : "menu"} size={11} /></button>
              <button onClick={() => setOpen(false)} className="win-btn" aria-label={tr("sitechat.closeAria", "Fermer")}>x</button>
            </span>
          </div>

          <div className="px-3 py-2 border-b-2 border-[var(--border)] flex items-center gap-2 bg-[var(--bg-card)]">
            <span className="w-2 h-2 bg-[var(--accent)] pulse-dot" />
            <span className="text-sm text-[var(--text-muted)]">{tr("sitechat.statusOnline", "Clio · assistante · en ligne")}</span>
          </div>

          <div ref={scroller} role="log" aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto p-3 space-y-2.5 relative bg-[var(--bg)]">
            {messages.length === 0 && (
              <div>
                <div className="win-flat p-3 mb-3">
                  <p className="text-base leading-snug">{tr("sitechat.greeting", "Bonjour. Je suis Clio. Choisis une rubrique pour naviguer, ou pose ta question.")}</p>
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
                    {tr(`sitechat.cta.${m.cta.key}`, m.cta.label)} <PixelIcon name="arrow-right" size={12} />
                  </button>
                )}
              </div>
            ))}
            {busy && <p className="text-sm text-[var(--text-muted)] pl-1">{tr("sitechat.typing", "Clio écrit")}<span className="blink">_</span></p>}

            {menuOpen && messages.length > 0 && (
              <div className="absolute inset-0 bg-[var(--bg)] p-3 overflow-y-auto">
                <MenuPanel onGo={go} onAsk={send} />
              </div>
            )}
          </div>

          <div className="p-2.5 border-t-2 border-[var(--border)] flex items-center gap-2 bg-[var(--bg-card)]">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) send(); }} aria-label={tr("sitechat.inputLabel", "Message")} placeholder={tr("sitechat.inputPlaceholder", "Écris ton message…")}
              className="pinput flex-1" />
            <button onClick={() => send()} disabled={busy || !input.trim()} data-sfx="send" className="pbtn pbtn-primary pbtn-sm shrink-0" aria-label={tr("sitechat.sendAria", "Envoyer")}>
              <PixelIcon name="send" size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
