"use client";

import { useMemo } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";
import { statusDot } from "@/lib/taskStatus";
import { useTasks } from "@/lib/useTasks";

export default function RecentActivity({ onOpen }: { onOpen?: () => void }) {
  const tr = useT();
  const { tasks: all, loaded } = useTasks();
  const tasks = useMemo(
    () => [...all].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? ""))).slice(0, 6),
    [all],
  );

  return (
    <div className="win-flat">
      <button onClick={onOpen} className="w-full px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between hover:bg-[var(--bg-card-hover)] transition-colors">
        <span className="flex items-center gap-2"><PixelIcon name="terminal" size={12} /> {tr("recent.title", "Activité moteur récente")}</span>
        <PixelIcon name="chevron-right" size={12} className="text-[var(--text-muted)]" />
      </button>
      <div className="divide-y-2 divide-[var(--border)]">
        {!loaded && <p className="px-3 py-2 text-sm text-[var(--text-muted)]">{tr("recent.loading", "chargement")}<span className="blink">_</span></p>}
        {loaded && tasks.length === 0 && <p className="px-3 py-2 text-sm text-[var(--text-muted)]">{tr("recent.empty", "aucune tâche pour l'instant. Lance un but dans Runs.")}</p>}
        {tasks.map((t) => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-2 text-base">
            <span className={`w-2 h-2 shrink-0 ${statusDot(t)}`} />
            <span className="flex-1 truncate">{t.title}</span>
            {t.costUsd != null && t.costUsd > 0 && <span className="text-sm text-[var(--text-muted)] font-mono">${t.costUsd.toFixed(3)}</span>}
            <span className="text-sm font-mono text-[var(--text-muted)]">{t.needsInput ? tr("recent.validation", "validation") : t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
