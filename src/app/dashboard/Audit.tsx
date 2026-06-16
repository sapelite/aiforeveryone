"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

type Task = { id: string; title: string; status: string; model?: string | null; costUsd?: number | null; createdAt?: string; completedAt?: string | null };

export default function Audit() {
  const [tasks, setTasks] = useState<Task[] | null>(null);

  useEffect(() => {
    const load = () => fetch("/api/engine/tasks").then((r) => r.json()).then((j) => setTasks(Array.isArray(j.tasks) ? j.tasks : [])).catch(() => setTasks([]));
    load();
    const id = setInterval(load, 6000);
    return () => clearInterval(id);
  }, []);

  if (tasks === null) return <p className="text-base text-[var(--text-muted)]">lecture du journal du moteur<span className="blink">_</span></p>;
  if (tasks.length === 0) return <div className="win-flat p-4 text-base text-[var(--text-muted)]">Aucune activité. Lance un but depuis la fenêtre Runs pour peupler le journal du moteur.</div>;

  const sorted = [...tasks].sort((a, b) => (b.completedAt || b.createdAt || "").localeCompare(a.completedAt || a.createdAt || ""));
  const tone = (s: string) => s === "completed" || s === "done" ? "text-[var(--accent)]" : s === "failed" || s === "error" ? "text-[var(--destructive)]" : "text-[var(--text-muted)]";
  const icon = (s: string) => s === "completed" || s === "done" ? "check" : s === "failed" || s === "error" ? "close" : "clock";

  return (
    <div className="win-flat">
      <div className="px-3 py-2 border-b-2 border-[var(--border)] font-display text-[9px] uppercase">Journal d&apos;activité du moteur · {tasks.length}</div>
      <div className="divide-y-2 divide-[var(--border)] max-h-[62vh] overflow-auto">
        {sorted.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-3 py-2.5">
            <PixelIcon name={icon(t.status)} size={14} className={tone(t.status)} />
            <div className="min-w-0 flex-1">
              <p className="text-base truncate">{t.title}</p>
              <p className="text-sm text-[var(--text-muted)] font-mono">{(t.completedAt || t.createdAt || "").slice(0, 16).replace("T", " ")}{t.model ? ` · ${t.model}` : ""}</p>
            </div>
            {t.costUsd != null && <span className="text-sm text-[var(--text-muted)] font-mono">${t.costUsd.toFixed(3)}</span>}
            <span className={`text-sm font-mono ${tone(t.status)}`}>{t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
