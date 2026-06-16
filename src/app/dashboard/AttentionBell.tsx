"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

/** Menu-bar indicator: how many engine tasks are waiting on the user right now. */
export default function AttentionBell({ onOpen }: { onOpen: () => void }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/engine/tasks")
        .then((r) => r.json())
        .then((j) => {
          const tasks = (Array.isArray(j) ? j : j.tasks ?? []) as Array<{ needsInput?: boolean | number }>;
          if (alive) setN(tasks.filter((t) => t.needsInput).length);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (n === 0) return null;
  return (
    <button onClick={onOpen} data-sfx="open" title={`${n} tâche(s) en attente de validation`} className="flex items-center gap-1 px-2 h-6 border-2 text-sm pulse-dot" style={{ borderColor: "var(--warning)", color: "var(--warning)" }}>
      <PixelIcon name="alert" size={12} /> {n}
    </button>
  );
}
