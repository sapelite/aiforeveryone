"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type Kpi = { online: boolean; tasks: number; cost: number; skills: number };

export default function EngineKpis({ onOpen }: { onOpen?: (view: string) => void }) {
  const [d, setD] = useState<Kpi | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [st, us, sk] = await Promise.all([
          fetch("/api/engine/status").then((r) => r.json()).catch(() => ({ online: false })),
          fetch("/api/engine/usage").then((r) => r.json()).catch(() => ({ count: 0, cost: 0 })),
          fetch("/api/engine/skills").then((r) => r.json()).catch(() => ({ skills: [] })),
        ]);
        if (alive) setD({ online: !!st.online, tasks: us.count ?? 0, cost: us.cost ?? 0, skills: (sk.skills ?? []).length });
      } catch { if (alive) setD({ online: false, tasks: 0, cost: 0, skills: 0 }); }
    };
    load();
    const id = setInterval(load, 8000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const cards: { icon: string; label: string; value: string; muted?: boolean; view: string }[] = [
    { icon: "cpu", label: "Moteur", value: d ? (d.online ? "en ligne" : "hors ligne") : "…", muted: d ? !d.online : true, view: "runs" },
    { icon: "terminal", label: "Tâches moteur", value: d ? String(d.tasks) : "…", view: "runs" },
    { icon: "coin", label: "Coût réel", value: d ? `$${(d.cost || 0).toFixed(2)}` : "…", view: "usage" },
    { icon: "command", label: "Skills", value: d ? String(d.skills) : "…", view: "skills" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const inner = (
          <>
            <p className="text-sm text-[var(--text-muted)] uppercase flex items-center gap-1.5"><PixelIcon name={c.icon} size={12} /> {c.label}</p>
            <p className={`font-display text-[clamp(0.9rem,2.4vw,1.4rem)] mt-3 ${c.muted ? "text-[var(--text-muted)]" : "text-[var(--accent)]"}`}>{c.value}</p>
          </>
        );
        return onOpen
          ? <button key={c.label} onClick={() => onOpen(c.view)} data-sfx="open" className="win-flat p-4 text-left hover:bg-[var(--bg-card-hover)] transition-colors">{inner}</button>
          : <div key={c.label} className="win-flat p-4">{inner}</div>;
      })}
    </div>
  );
}
