"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";

type Kpi = { online: boolean; tasks: number; cost: number; skills: number };

export default function EngineKpis({ onOpen }: { onOpen?: (view: string) => void }) {
  const tr = useT();
  const [d, setD] = useState<Kpi | null>(null);

  useEffect(() => {
    let alive = true;
    let skills = 0;
    let gotSkills = false;
    const load = async () => {
      try {
        const reqs: Promise<Record<string, unknown>>[] = [
          fetch("/api/engine/status").then((r) => r.json()).catch(() => ({ online: false })),
          fetch("/api/engine/usage").then((r) => r.json()).catch(() => ({ count: 0, cost: 0 })),
        ];
        // skills count is static for a session — fetch it once, not every tick
        if (!gotSkills) reqs.push(fetch("/api/engine/skills").then((r) => r.json()).catch(() => ({ skills: [] })));
        const [st, us, sk] = await Promise.all(reqs);
        if (sk) { skills = ((sk.skills as unknown[]) ?? []).length; gotSkills = true; }
        if (alive) setD({ online: !!st.online, tasks: (us.count as number) ?? 0, cost: (us.cost as number) ?? 0, skills });
      } catch { if (alive) setD({ online: false, tasks: 0, cost: 0, skills }); }
    };
    load();
    const id = setInterval(load, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const cards: { icon: string; label: string; value: string; muted?: boolean; view: string }[] = [
    { icon: "cpu", label: tr("kpis.engineLabel", "Moteur"), value: d ? (d.online ? tr("kpis.online", "en ligne") : tr("kpis.offline", "hors ligne")) : "…", muted: d ? !d.online : true, view: "runs" },
    { icon: "terminal", label: tr("kpis.engineTasks", "Tâches moteur"), value: d ? String(d.tasks) : "…", view: "runs" },
    { icon: "coin", label: tr("kpis.realCost", "Coût réel"), value: d ? `$${(d.cost || 0).toFixed(2)}` : "…", view: "usage" },
    { icon: "command", label: tr("kpis.skills", "Skills"), value: d ? String(d.skills) : "…", view: "skills" },
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
