"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type T = { id: string; title: string; status: string; costUsd?: number | null; updatedAt?: string; needsInput?: boolean | number };

export default function RecentActivity({ onOpen }: { onOpen?: () => void }) {
  const [tasks, setTasks] = useState<T[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/engine/tasks")
        .then((r) => r.json())
        .then((j) => {
          const list = (Array.isArray(j) ? j : j.tasks ?? []) as T[];
          const sorted = [...list].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
          if (alive) setTasks(sorted.slice(0, 6));
        })
        .catch(() => alive && setTasks([]));
    load();
    const id = setInterval(load, 12000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  const dot = (t: T) =>
    t.needsInput || t.status === "running" ? "bg-[var(--warning)] pulse-dot"
      : t.status === "done" || t.status === "completed" ? "bg-[var(--accent)]"
      : t.status === "failed" || t.status === "error" ? "bg-[var(--destructive)]" : "bg-[var(--text-muted)]";

  return (
    <div className="win-flat">
      <button onClick={onOpen} className="w-full px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase flex items-center justify-between hover:bg-[var(--bg-card-hover)] transition-colors">
        <span className="flex items-center gap-2"><PixelIcon name="terminal" size={12} /> Activité moteur récente</span>
        <PixelIcon name="chevron-right" size={12} className="text-[var(--text-muted)]" />
      </button>
      <div className="divide-y-2 divide-[var(--border)]">
        {tasks === null && <p className="px-3 py-2 text-sm text-[var(--text-muted)]">chargement<span className="blink">_</span></p>}
        {tasks?.length === 0 && <p className="px-3 py-2 text-sm text-[var(--text-muted)]">aucune tâche pour l&apos;instant. Lance un but dans Runs.</p>}
        {tasks?.map((t) => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-2 text-base">
            <span className={`w-2 h-2 shrink-0 ${dot(t)}`} />
            <span className="flex-1 truncate">{t.title}</span>
            {t.costUsd != null && t.costUsd > 0 && <span className="text-sm text-[var(--text-muted)] font-mono">${t.costUsd.toFixed(3)}</span>}
            <span className="text-sm font-mono text-[var(--text-muted)]">{t.needsInput ? "validation" : t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
