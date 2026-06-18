"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

/** Superset of the task fields the dashboard panels read. */
export type EngineTask = {
  id: string;
  title?: string;
  status?: string;
  needsInput?: boolean | number;
  costUsd?: number | null;
  model?: string | null;
  errorMessage?: string | null;
  activityLabel?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
};

type Ctx = { tasks: EngineTask[]; online: boolean | null; loaded: boolean };

const TasksCtx = createContext<Ctx>({ tasks: [], online: null, loaded: false });

const EVENTS = [
  "connected", "offline", "task:created", "task:updated", "task:status",
  "task:progress", "task:output", "task:question", "task:log", "task:deleted",
];

/**
 * One shared engine-task source for the whole dashboard. Previously Board,
 * Audit, RecentActivity, AttentionBell and HiveGraph each polled
 * /api/engine/tasks on their own timer (4-5x the same full-list fetch). This
 * owns a single EventSource onto /api/engine/events (the stream Runs already
 * proves) plus a 60s reconcile fetch that heals any missed delta and refreshes
 * cost/timestamp fields. The last-known map is kept on disconnect so panels
 * never blank, and native EventSource reconnects on its own.
 */
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [map, setMap] = useState<Record<string, EngineTask>>({});
  const [online, setOnline] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Seed once, then reconcile periodically (heals missed events + stale fields).
  useEffect(() => {
    let alive = true;
    const seed = () =>
      fetch("/api/engine/tasks")
        .then((r) => r.json())
        .then((j) => {
          if (!alive) return;
          const list = (Array.isArray(j) ? j : j.tasks ?? []) as EngineTask[];
          setMap((prev) => {
            const next: Record<string, EngineTask> = {};
            for (const t of list) if (t?.id) next[t.id] = { ...prev[t.id], ...t };
            return next;
          });
          setLoaded(true);
        })
        .catch(() => alive && setLoaded(true));
    seed();
    const id = setInterval(seed, 60000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  // Single live stream. Mirrors Runs.tsx: onerror just flags offline and lets
  // the browser auto-reconnect; no manual close/retry (which would fight it).
  useEffect(() => {
    const es = new EventSource("/api/engine/events");
    const handler = (type: string) => (e: MessageEvent) => {
      try {
        if (type === "offline") { setOnline(false); return; }
        if (type === "connected") { setOnline(true); return; }
        const ev = JSON.parse(e.data) as { task?: EngineTask };
        const t = ev.task;
        if (!t?.id) return;
        setOnline(true);
        if (type === "task:deleted") {
          setMap((m) => { if (!m[t.id]) return m; const { [t.id]: _drop, ...rest } = m; return rest; });
          return;
        }
        setMap((m) => ({ ...m, [t.id]: { ...m[t.id], ...t } }));
      } catch { /* ignore malformed */ }
    };
    EVENTS.forEach((ty) => es.addEventListener(ty, handler(ty)));
    es.onerror = () => setOnline(false);
    return () => es.close();
  }, []);

  const tasks = useMemo(() => Object.values(map), [map]);
  const value = useMemo(() => ({ tasks, online, loaded }), [tasks, online, loaded]);
  return <TasksCtx.Provider value={value}>{children}</TasksCtx.Provider>;
}

export const useTasks = () => useContext(TasksCtx);
