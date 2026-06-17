"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PixelIcon } from "@/components/PixelIcon";
import { play } from "@/lib/sound";

type T = { id: string; status?: string; needsInput?: boolean | number };

/** Global kill-switch: cancels every running engine task and aborts ClaudeClaw. */
export default function PanicButton() {
  const [busy, setBusy] = useState(false);

  async function panic() {
    if (busy) return;
    setBusy(true);
    play("error");
    let n = 0;
    try {
      const j = await fetch("/api/engine/tasks").then((r) => r.json()).catch(() => ({ tasks: [] }));
      const running = ((Array.isArray(j) ? j : j.tasks ?? []) as T[]).filter((t) => t.status === "running" || t.status === "queued" || t.needsInput);
      for (const t of running) {
        await fetch("/api/engine/cancel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId: t.id }) }).catch(() => {});
        n++;
      }
      await fetch("/api/claw/abort", { method: "POST" }).catch(() => {});
    } catch { /* best-effort */ }
    setBusy(false);
    toast.success("Arrêt d'urgence", { description: `${n} tâche(s) moteur arrêtée(s) · ClaudeClaw interrompu` });
  }

  return (
    <button
      onClick={panic}
      disabled={busy}
      title="Arrêt d'urgence : stoppe toutes les tâches moteur et interrompt ClaudeClaw"
      aria-label="Arrêt d'urgence"
      className="hidden sm:flex items-center gap-1 px-2 h-6 border-2 text-sm disabled:opacity-50"
      style={{ borderColor: "var(--destructive)", color: "var(--destructive)" }}
    >
      <PixelIcon name="close" size={12} /> {busy ? "…" : "STOP"}
    </button>
  );
}
