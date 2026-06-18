"use client";

import { PixelIcon } from "@/components/PixelIcon";
import { useT } from "@/lib/i18n";
import { useTasks } from "@/lib/useTasks";

/** Menu-bar indicator: how many engine tasks are waiting on the user right now.
 *  Reads the shared task source (live via SSE), so it reacts near-instantly. */
export default function AttentionBell({ onOpen }: { onOpen: () => void }) {
  const tr = useT();
  const { tasks } = useTasks();
  const n = tasks.filter((t) => t.needsInput).length;

  if (n === 0) return null;
  return (
    <button onClick={onOpen} data-sfx="open" title={`${n} ${tr("bell.tasksWaiting", "tâche(s) en attente de validation")}`} className="flex items-center gap-1 px-2 h-6 border-2 text-sm pulse-dot" style={{ borderColor: "var(--warning)", color: "var(--warning)" }}>
      <PixelIcon name="alert" size={12} /> {n}
    </button>
  );
}
