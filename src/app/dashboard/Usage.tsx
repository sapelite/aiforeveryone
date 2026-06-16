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

  if (!u) return <p className="text-base text-[var(--text-muted)]">lecture de la consommation réelle<span className="blink">_</span></p>;

  const cards = [
    { label: "Tâches exécutées", value: String(u.count) },
    { label: "Coût réel cumulé", value: `$${(u.cost || 0).toFixed(2)}` },
    { label: "Tokens consommés", value: (u.tokens || 0).toLocaleString("fr-FR") },
  ];

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
          <div className="p-3 space-y-1">
            {Object.keys(u.byModel || {}).length === 0
              ? <p className="text-sm text-[var(--text-muted)]">aucune donnée</p>
              : Object.entries(u.byModel).map(([m, n]) => <div key={m} className="flex justify-between text-base"><span className="font-mono">{m}</span><span className="text-[var(--text-muted)]">{n}</span></div>)}
          </div>
        </div>
        <div className="win-flat">
          <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">Par statut</div>
          <div className="p-3 space-y-1">
            {Object.keys(u.byStatus || {}).length === 0
              ? <p className="text-sm text-[var(--text-muted)]">aucune donnée</p>
              : Object.entries(u.byStatus).map(([s, n]) => <div key={s} className="flex justify-between text-base"><span className="font-mono">{s}</span><span className="text-[var(--text-muted)]">{n}</span></div>)}
          </div>
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)]">Coût réel issu des tâches du moteur (cost_usd). Lancez les tâches simples sur Haiku pour réduire la facture.</p>
    </div>
  );
}
