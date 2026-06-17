"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";

/** Live Agentic OS engine connectivity pill for the dashboard menu bar. */
export default function EngineStatus() {
  const tr = useT();
  const [s, setS] = useState<{ online: boolean; port: number | null } | null>(null);

  useEffect(() => {
    let alive = true;
    const check = () =>
      fetch("/api/engine/status")
        .then((r) => r.json())
        .then((d) => alive && setS({ online: !!d.online, port: d.port ?? null }))
        .catch(() => alive && setS({ online: false, port: null }));
    check();
    const id = setInterval(check, 10000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const online = s?.online;
  return (
    <span
      title={online ? `${tr("enginestatus.titleOnline", "Moteur Agentic OS en ligne")} (port ${s?.port})` : tr("enginestatus.titleOffline", "Moteur Agentic OS hors ligne")}
      className="hidden sm:flex items-center gap-1.5 px-2 text-sm border-l-2 border-[var(--border)]"
    >
      <PixelIcon name="cpu" size={14} className={online ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />
      <span className={online ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}>{s === null ? "…" : online ? tr("enginestatus.labelOnline", "moteur") : tr("enginestatus.labelOffline", "hors ligne")}</span>
      <span className={`w-2 h-2 ${online ? "bg-[var(--accent)] pulse-dot" : "bg-[var(--text-muted)]"}`} />
    </span>
  );
}
