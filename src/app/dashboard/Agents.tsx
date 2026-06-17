"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type Agent = { id: string; name: string; description: string; model: string; running: boolean; todayTurns: number; todayCost: number };

/** The real ClaudeClaw agent roster (source of truth), surfaced in the pixel OS. */
export default function Agents() {
  const [agents, setAgents] = useState<Agent[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/claw/agents").then((r) => r.json()).then((j) => alive && setAgents(j.agents ?? [])).catch(() => alive && setAgents([]));
    load();
    const id = setInterval(load, 10000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (agents === null) return <p role="status" className="text-base text-[var(--text-muted)]">chargement des agents<span className="blink">_</span></p>;
  if (agents.length === 0) return <div role="status" className="win-flat p-4 text-base text-[var(--text-muted)]">Aucun agent ClaudeClaw détecté. Démarre ClaudeClaw, ou ajoute un agent avec <span className="font-mono">npm run agent:create</span> dans le workspace ClaudeClaw.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {agents.map((a) => (
        <div key={a.id} className="win-flat p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="w-10 h-10 border-2 border-[var(--border)] bg-[var(--accent)] grid place-items-center"><PixelIcon name="users" size={18} className="text-[#1b1b1b]" /></span>
            <span className="flex items-center gap-1.5 text-sm"><span className={`w-2 h-2 ${a.running ? "bg-[var(--accent)] pulse-dot" : "bg-[var(--text-muted)]"}`} />{a.running ? "actif" : "au repos"}</span>
          </div>
          <p className="font-mono text-base">{a.name || a.id}</p>
          {a.description && <p className="text-sm text-[var(--text-muted)] mt-1 leading-snug line-clamp-2">{a.description}</p>}
          <div className="flex items-center justify-between pt-3 mt-3 border-t-2 border-[var(--border)] text-sm font-mono text-[var(--text-muted)]">
            <span className="truncate">{a.model}</span>
            <span className="shrink-0">{a.todayTurns} tours · ${(a.todayCost ?? 0).toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
