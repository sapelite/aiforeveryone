"use client";

import { useEffect, useState } from "react";

type Usage = { count: number; cost: number; tokens: number; byModel: Record<string, number>; byStatus: Record<string, number> };

export default function Usage() {
  const [u, setU] = useState<Usage | null>(null);

  useEffect(() => {
    const load = () => fetch("/api/engine/usage").then((r) => r.json()).then(setU).catch(() => setU(null));
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  if (!u) return <p role="status" className="text-base text-[var(--text-muted)]">lecture de la consommation réelle<span className="blink">_</span></p>;

  const cards = [
    { label: "Tâches exécutées", value: String(u.count) },
    { label: "Coût réel cumulé", value: `$${(u.cost || 0).toFixed(2)}` },
    { label: "Tokens consommés", value: (u.tokens || 0).toLocaleString("fr-FR") },
  ];
  const statusColor = (s: string) => s === "done" || s === "completed" ? "var(--accent)" : s === "failed" || s === "error" ? "var(--destructive)" : s === "running" ? "var(--warning)" : "var(--text-muted)";
  const totalRuns = Object.values(u.byModel || {}).reduce((a, b) => a + b, 0);
  const ecoPct = totalRuns ? Math.round((((u.byModel?.haiku ?? 0) + (u.byModel?.sonnet ?? 0)) / totalRuns) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="win-flat p-4">
            <p className="text-sm text-[var(--text-muted)] uppercase">{c.label}</p>
            <p className="font-display text-[clamp(0.9rem,2.2vw,1.3rem)] text-[var(--accent)] mt-3">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="win-flat">
          <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">Par modèle</div>
          <div className="p-3 space-y-1.5">
            {Object.keys(u.byModel || {}).length === 0
              ? <p className="text-sm text-[var(--text-muted)]">aucune donnée</p>
              : (() => { const max = Math.max(...Object.values(u.byModel)); return Object.entries(u.byModel).sort((a, b) => b[1] - a[1]).map(([m, n]) => (
                  <div key={m} className="text-base">
                    <div className="flex justify-between mb-0.5"><span className="font-mono">{m}</span><span className="text-[var(--text-muted)]">{n}</span></div>
                    <div className="h-2 border-2 border-[var(--border)] bg-[var(--bg)]"><div className="h-full bg-[var(--accent)]" style={{ width: `${max ? (n / max) * 100 : 0}%` }} /></div>
                  </div>
                )); })()}
          </div>
        </div>
        <div className="win-flat">
          <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">Par statut</div>
          <div className="p-3 space-y-1.5">
            {Object.keys(u.byStatus || {}).length === 0
              ? <p className="text-sm text-[var(--text-muted)]">aucune donnée</p>
              : (() => { const max = Math.max(...Object.values(u.byStatus)); return Object.entries(u.byStatus).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
                  <div key={s} className="text-base">
                    <div className="flex justify-between mb-0.5"><span className="font-mono">{s}</span><span className="text-[var(--text-muted)]">{n}</span></div>
                    <div className="h-2 border-2 border-[var(--border)] bg-[var(--bg)]"><div className="h-full" style={{ width: `${max ? (n / max) * 100 : 0}%`, background: statusColor(s) }} /></div>
                  </div>
                )); })()}
          </div>
        </div>
      </div>
      {totalRuns > 0 && <p className="text-base"><span className="text-[var(--accent)] font-mono">{ecoPct}%</span> <span className="text-[var(--text-muted)]">des tâches tournent sur des modèles économiques (haiku/sonnet) via le routage cheap-first.</span></p>}
      <p className="text-sm text-[var(--text-muted)]">Coût réel issu des tâches du moteur (cost_usd). Lancez les tâches simples sur Haiku pour réduire la facture.</p>
    </div>
  );
}
