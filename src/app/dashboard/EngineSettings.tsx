"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type S = { online: boolean; baseUrl: string | null; workspace: string; port: number | null };

export default function EngineSettings() {
  const [s, setS] = useState<S | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => fetch("/api/engine/status").then((r) => r.json()).then((d) => alive && setS(d)).catch(() => alive && setS(null));
    load();
    const id = setInterval(load, 12000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <div className="win-flat">
      <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center gap-2"><PixelIcon name="cpu" size={12} /> Moteur Agentic OS</div>
      <div className="p-3 space-y-1.5 text-base">
        <div className="flex justify-between"><span className="text-[var(--text-muted)]">État</span><span className={s?.online ? "text-[var(--accent)]" : "text-[var(--destructive)]"}>{s === null ? "…" : s.online ? "en ligne" : "hors ligne"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-[var(--text-muted)] shrink-0">Workspace</span><span className="font-mono text-right truncate">{s?.workspace ?? "—"}</span></div>
        <div className="flex justify-between"><span className="text-[var(--text-muted)]">Port</span><span className="font-mono">{s?.port ?? "—"}</span></div>
        {s?.online && s.baseUrl && <a href={s.baseUrl} target="_blank" rel="noreferrer" className="pbtn pbtn-sm mt-1"><PixelIcon name="external-link" size={12} /> Ouvrir le command-centre</a>}
        {s && !s.online && <p className="text-sm text-[var(--text-muted)] mt-1 leading-snug">Hors ligne. Démarre le command-centre dans le workspace <span className="font-mono">agenticdenoob</span> (PORT=3100).</p>}
      </div>
    </div>
  );
}
