"use client";

import { useRef, useState } from "react";
import { Send, Crown, Hash } from "lucide-react";

const PALETTE = ["#60a5fa", "#a78bfa", "#34d399", "#f472b6", "#fbbf24", "#22d3ee", "#fb7185", "#818cf8"];
const THINKING = ["esquisse…", "réflexion…", "recoupe le hive mind…", "pondère…", "analyse…", "vérifie la mémoire…"];

type Agent = { slug: string; display: string; role: string };
type Msg = {
  id: string; kind: "cmd" | "agent";
  text?: string; agent?: string; role?: string; color?: string; thinking?: boolean;
};

const uid = () => Math.random().toString(36).slice(2);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ─── moteur de perspective (stand-in démo ; remplaçable par un appel Claude API) ─── */
function standupLine(a: Agent): string {
  const byRole: Record<string, string> = {
    Stratège: "J'ai cadré la revue trimestrielle Globex et arbitré la priorité Q2 sur la qualification de leads.",
    Opérations: "J'ai optimisé le process d'onboarding (–2 étapes manuelles) et préparé l'automatisation du reporting.",
    Ventes: "12 leads qualifiés, proposition Umbrella envoyée, relance Initech programmée. Pipeline à 210 k€.",
    Reporting: "Rapport S23 généré : temps automatisé +24%, mais satisfaction support à surveiller.",
    Support: "Ticket Soylent escaladé aux Ops, 4 fiches FAQ créées à partir des questions récurrentes.",
  };
  return byRole[a.display] ?? `Avancement sur mes sujets (${a.role}) : tâches traitées, rien de bloquant de mon côté.`;
}

function discussLine(a: Agent, q: string): string {
  const topic = q.replace(/^\/discuss\s*/i, "").trim() || "cette décision";
  const byRole: Record<string, string> = {
    Stratège: `Sur « ${topic} » : la vraie question est l'alignement avec nos objectifs. Je le ferais seulement si l'impact est mesurable sous 90 jours — sinon on disperse l'équipe.`,
    Opérations: `« ${topic} » ajoute de l'overhead. Avant de lancer, montrez-moi le process : qui fait quoi, avec quel outil. Sans ça, on automatise le chaos.`,
    Ventes: `Côté pipeline, « ${topic} » n'a de sens que si ça raccourcit le cycle ou augmente la valeur du deal. Sinon c'est une distraction par rapport au closing.`,
    Reporting: `Je ne peux pas valider « ${topic} » sans baseline. Définissons le KPI de succès et la période avant d'engager quoi que ce soit.`,
    Support: `Pensez à l'impact client de « ${topic} ». Un compte à risque comme Soylent ne pardonnera pas une priorité mal placée.`,
  };
  return byRole[a.display] ?? `Mon angle (${a.role}) sur « ${topic} » : utile si ça sert directement mon périmètre, à challenger sinon.`;
}

export default function WarRoom({ agents, instanceId }: { agents: Agent[]; instanceId: string }) {
  const colored = agents.map((a, i) => ({ ...a, color: PALETTE[i % PALETTE.length] }));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [excluded, setExcluded] = useState<Set<string>>(new Set());
  const [lead, setLead] = useState<string>(colored[0]?.slug ?? "");
  const scroller = useRef<HTMLDivElement>(null);

  const push = (m: Msg) => setMessages((p) => [...p, m]);
  const update = (id: string, patch: Partial<Msg>) =>
    setMessages((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const scroll = () => requestAnimationFrame(() => scroller.current?.scrollTo({ top: 9e9, behavior: "smooth" }));

  function participants(raw: string): typeof colored {
    const mentions = (raw.match(/@([\wà-ÿ-]+)/gi) || []).map((s) => s.slice(1).toLowerCase());
    let list = colored.filter((a) => !excluded.has(a.slug));
    if (mentions.length) {
      list = colored.filter((a) =>
        mentions.some((m) => a.display.toLowerCase().includes(m) || a.slug.includes(m))
      );
    }
    // lead en premier
    return list.sort((a, b) => (a.slug === lead ? -1 : b.slug === lead ? 1 : 0));
  }

  async function run(raw: string) {
    const cmd = raw.trim();
    if (!cmd || running) return;
    setInput("");
    push({ id: uid(), kind: "cmd", text: cmd });
    scroll();

    const isStandup = /^\/standup\b/i.test(cmd);
    const isDiscuss = /^\/discuss\b/i.test(cmd);
    if (!isStandup && !isDiscuss) {
      push({ id: uid(), kind: "agent", agent: "Système", role: "", color: "#71717a", text: "Commandes : /standup [@agent…] ou /discuss <question>." });
      scroll();
      return;
    }

    setRunning(true);
    const parts = participants(cmd);
    const topic = cmd.replace(/^\/discuss\s*/i, "").trim();
    for (const p of parts) {
      const id = uid();
      push({ id, kind: "agent", agent: p.display, role: p.role, color: p.color, thinking: true });
      scroll();
      await sleep(250);
      let text: string;
      try {
        const res = await fetch("/api/warroom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: instanceId, slug: p.slug, kind: isStandup ? "standup" : "discuss", topic }),
        });
        const j = await res.json();
        text = j.ok && j.text ? j.text : isStandup ? standupLine(p) : discussLine(p, cmd);
      } catch {
        text = isStandup ? standupLine(p) : discussLine(p, cmd);
      }
      update(id, { thinking: false, text });
      scroll();
    }
    setRunning(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4 h-full min-h-[420px]">
      {/* fil */}
      <div className="flex flex-col rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="h-full grid place-items-center text-center text-sm text-[var(--text-muted)]">
              <div>
                <p className="mb-2">War Room · textuelle</p>
                <p className="text-xs">Essaie <code className="text-blue-400">/standup</code> ou <code className="text-blue-400">/discuss Faut-il lancer une communauté de memes IA ?</code></p>
              </div>
            </div>
          )}
          {messages.map((m) =>
            m.kind === "cmd" ? (
              <div key={m.id} className="flex justify-end">
                <span className="px-3 py-1.5 rounded-lg bg-blue-500/15 text-blue-200 text-sm font-mono">{m.text}</span>
              </div>
            ) : (
              <div key={m.id} className="flex gap-2.5">
                <div className="w-7 h-7 rounded-lg shrink-0 grid place-items-center text-[11px] font-bold"
                     style={{ background: `${m.color}22`, color: m.color }}>
                  {m.agent?.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">
                    <span style={{ color: m.color }}>{m.agent}</span>
                    {m.role && <span className="text-[var(--text-muted)]"> · {m.role}</span>}
                  </p>
                  {m.thinking ? (
                    <p className="text-sm text-[var(--text-muted)] italic">{THINKING[Math.floor(Math.random() * THINKING.length)]}</p>
                  ) : (
                    <p className="text-sm text-[var(--text)] leading-relaxed">{m.text}</p>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* saisie */}
        <div className="border-t-2 border-[var(--border)] p-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <button onClick={() => run("/standup")} disabled={running}
                    className="px-2.5 h-8 rounded-lg text-xs border-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40">/standup</button>
            <button onClick={() => setInput("/discuss ")} disabled={running}
                    className="px-2.5 h-8 rounded-lg text-xs border-2 border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-card-hover)] disabled:opacity-40">/discuss</button>
          </div>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(input)}
            placeholder="/discuss <question>  ou  /standup @Ventes"
            className="flex-1 bg-[var(--bg-card)] border-2 border-[var(--border)] rounded-lg px-3 h-8 text-sm placeholder:text-[var(--text-muted)] outline-none focus:border-blue-500/40"
          />
          <button onClick={() => run(input)} disabled={running}
                  className="w-8 h-8 grid place-items-center rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* roster */}
      <div className="rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)] p-4 h-fit">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5" /> Roster du standup
        </p>
        <div className="space-y-1.5">
          {colored.map((a) => {
            const inc = !excluded.has(a.slug);
            const isLead = lead === a.slug;
            return (
              <div key={a.slug} className="flex items-center gap-2">
                <button
                  onClick={() => setExcluded((p) => { const n = new Set(p); n.has(a.slug) ? n.delete(a.slug) : n.add(a.slug); return n; })}
                  className={`flex-1 flex items-center gap-2 px-2 h-8 rounded-lg text-sm transition-colors ${inc ? "text-[var(--text)]" : "text-[var(--text-muted)] line-through"}`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: inc ? a.color : "#3f3f46" }} />
                  {a.display}
                </button>
                <button onClick={() => setLead(a.slug)} title="Désigner comme lead"
                        className={`w-7 h-7 grid place-items-center rounded-lg ${isLead ? "text-amber-400 bg-amber-400/10" : "text-[var(--text-muted)] hover:text-[var(--text)]"}`}>
                  <Crown className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-[var(--text-muted)] mt-3 leading-relaxed">
          Clic = inclure/exclure · <Crown className="w-3 h-3 inline -mt-0.5 text-amber-400" /> = lead (parle en premier).
        </p>
      </div>
    </div>
  );
}
