"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";
import { useT } from "@/lib/i18n";
import { useTasks } from "@/lib/useTasks";

/** Global kill-switch: cancels every running engine task and aborts ClaudeClaw. */
export default function PanicButton() {
  const tr = useT();
  const { tasks } = useTasks();
  const [busy, setBusy] = useState(false);

  async function panic() {
    if (busy) return;
    setBusy(true);
    play("error");
    let n = 0;
    try {
      const running = tasks.filter((t) => t.status === "running" || t.status === "queued" || t.needsInput);
      for (const t of running) {
        await fetch("/api/engine/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: t.id }) }).catch(() => {});
        n++;
      }
      await fetch("/api/claw/abort", { method: "POST" }).catch(() => {});
    } catch { /* best-effort */ }
    setBusy(false);
    toast.success(tr("panic.toastTitle", "Arrêt d'urgence"), { description: `${n} ${tr("panic.toastTasksStopped", "tâche(s) moteur arrêtée(s)")} · ${tr("panic.toastClawAborted", "ClaudeClaw interrompu")}` });
  }

  return (
    <button
      onClick={panic}
      disabled={busy}
      title={tr("panic.buttonTitle", "Arrêt d'urgence : stoppe toutes les tâches moteur et interrompt ClaudeClaw")}
      aria-label={tr("panic.ariaLabel", "Arrêt d'urgence")}
      className="hidden sm:flex items-center gap-1 px-2 h-6 border-2 text-sm disabled:opacity-50"
      style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
    >
      <PixelIcon name="close" size={12} /> {busy ? "…" : tr("panic.label", "STOP")}
    </button>
  );
}
