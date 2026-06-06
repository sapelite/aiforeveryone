"use client";

import type { InstanceData } from "@/lib/instance";
import { Lightbulb, UserPlus, AlertTriangle, TrendingDown } from "lucide-react";

/* Mots-clés pour savoir si une fonction est couverte par un agent existant. */
const FN_KEYWORDS: Record<string, string[]> = {
  Ventes: ["vente", "sales", "pipeline", "commercial"],
  Opérations: ["op", "process", "automat"],
  Finance: ["finance", "compta", "budget", "mrr"],
  Marketing: ["marketing", "content", "contenu", "brand", "comms", "social"],
  Support: ["support", "client", "ticket", "success"],
  Produit: ["produit", "product", "roadmap"],
  Reporting: ["report", "kpi", "analytic"],
  Engineering: ["eng", "dev", "code", "infra"],
};

type Insight = {
  kind: "gap" | "overload" | "idle";
  icon: typeof Lightbulb;
  title: string;
  body: string;
  create?: string; // nom d'agent à créer
};

function buildInsights(data: InstanceData): Insight[] {
  const out: Insight[] = [];
  const p = data.personality;
  const agentsText = data.agents.map((a) => `${a.display} ${a.role} ${a.slug}`.toLowerCase());
  const covered = (fn: string) =>
    (FN_KEYWORDS[fn] ?? []).some((kw) => agentsText.some((t) => t.includes(kw)));

  if (p) {
    const total = Object.values(p.functions).reduce((a, b) => a + b, 0) || 1;
    for (const [fn, n] of Object.entries(p.functions).sort((a, b) => b[1] - a[1])) {
      const share = n / total;
      if (share >= 0.08 && !covered(fn)) {
        out.push({
          kind: "gap",
          icon: UserPlus,
          title: `Aucun agent dédié à ${fn}`,
          body: `${fn} pèse ${Math.round(share * 100)}% de l'activité détectée mais aucun agent ne le couvre. Un agent spécialisé éviterait de diluer cette charge ailleurs.`,
          create: fn,
        });
      }
    }
  }

  // surcharge : agent avec >= 3 tâches actives
  for (const a of data.agents) {
    const load = data.tasks.filter((t) => t.agent === a.display && t.status !== "done").length;
    if (load >= 3) {
      out.push({
        kind: "overload",
        icon: AlertTriangle,
        title: `${a.display} est surchargé`,
        body: `${load} tâches actives sur le même agent — risque de goulot. Distribue la charge ou crée un sous-agent.`,
      });
    }
  }

  // sous-utilisation : agent en ligne sans tâche active
  for (const a of data.agents.filter((x) => x.status === "online")) {
    const load = data.tasks.filter((t) => t.agent === a.display && t.status !== "done").length;
    if (load === 0) {
      out.push({
        kind: "idle",
        icon: TrendingDown,
        title: `${a.display} est sous-utilisé`,
        body: `Aucune tâche active. Réassigne-lui du travail ou mets-le en veille pour économiser des tokens.`,
      });
    }
  }

  return out.slice(0, 4);
}

export default function AgentInsights({ data, onCreate }: { data: InstanceData; onCreate: (name: string) => void }) {
  const insights = buildInsights(data);
  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl border-2 border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-2 px-4 py-3 border-b-2 border-[var(--border)]">
        <Lightbulb className="w-4 h-4 acc-text-strong" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Agent Insights</h3>
        <span className="text-xs text-[var(--text-muted)]">· proactif · basé sur la personality</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border)]">
        {insights.map((ins, i) => (
          <div key={i} className="bg-[var(--bg-card)] p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-card-hover)] border-2 border-[var(--border)] grid place-items-center shrink-0">
              <ins.icon className={`w-4 h-4 ${ins.kind === "overload" ? "text-amber-400" : ins.kind === "idle" ? "text-[var(--text-muted)]" : "acc-text"}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{ins.title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{ins.body}</p>
              {ins.create && (
                <button
                  onClick={() => onCreate(ins.create!)}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-xs acc-bg text-white hover:opacity-90 transition-opacity"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Créer l&apos;agent {ins.create}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
