"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type Kpi = { online: boolean; tasks: number; cost: number; skills: number };

export default function EngineKpis() {
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

  const cards: { icon: string; label: string; value: string; muted?: boolean }[] = [
    { icon: "cpu", label: "Moteur", value: d ? (d.online ? "en ligne" : "hors ligne") : "…", muted: d ? !d.online : true },
    { icon: "terminal", label: "Tâches moteur", value: d ? String(d.tasks) : "…" },
    { icon: "coin", label: "Coût réel", value: d ? `$${(d.cost || 0).toFixed(2)}` : "…" },
    { icon: "command", label: "Skills", value: d ? String(d.skills) : "…" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="win-flat p-4">
          <p className="text-sm text-[var(--text-muted)] uppercase flex items-center gap-1.5"><PixelIcon name={c.icon} size={12} /> {c.label}</p>
          <p className={`font-display text-[clamp(0.9rem,2.4vw,1.4rem)] mt-3 ${c.muted ? "text-[var(--text-muted)]" : "text-[var(--accent)]"}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}
