"use client";

import { useMemo } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";
import { statusTextClass, statusIcon } from "@/lib/taskStatus";
import { useTasks } from "@/lib/useTasks";
import { PanelState } from "@/components/PanelState";

export default function Audit() {
  const tr = useT();
  const { tasks, loaded, online } = useTasks();

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => (b.completedAt || b.createdAt || "").localeCompare(a.completedAt || a.createdAt || "")),
    [tasks],
  );

  if (!loaded) return <p className="text-base text-[var(--text-muted)]">{tr("audit.loading", "lecture du journal du moteur")}<span className="blink">_</span></p>;
  if (tasks.length === 0) return online === false
    ? <PanelState icon="cpu">{tr("panel.engineOffline", "Moteur hors ligne — démarre le command-centre Agentic OS")}</PanelState>
    : <PanelState>{tr("audit.empty", "Aucune activité. Lance un but depuis la fenêtre Runs pour peupler le journal du moteur.")}</PanelState>;

  return (
    <div className="win-flat">
      <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">{tr("audit.header", "Journal d'activité du moteur")} · {tasks.length}</div>
      <div className="divide-y-2 divide-[var(--border)] max-h-[62vh] overflow-auto">
        {sorted.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2.5">
            <PixelIcon name={statusIcon(t)} size={14} className={statusTextClass(t)} />
            <div className="min-w-0 flex-1">
              <p className="text-base truncate">{t.title}</p>
              <p className="text-sm text-[var(--text-muted)] font-mono">{(t.completedAt || t.createdAt || "").slice(0, 16).replace("T", " ")}{t.model ? ` · ${t.model}` : ""}</p>
            </div>
            {t.costUsd != null && <span className="text-sm text-[var(--text-muted)] font-mono">${t.costUsd.toFixed(3)}</span>}
            <span className={`text-sm font-mono ${statusTextClass(t)}`}>{t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
