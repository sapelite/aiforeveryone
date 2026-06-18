import { PixelIcon } from "@/components/PixelIcon";

/**
 * Shared empty / offline state for dashboard panels: a bordered pixel icon over
 * a message, matching the OS aesthetic. Replaces the bare one-line text states
 * and lets panels distinguish "engine offline" from "genuinely empty". Children
 * are ReactNode so callers keep their inline links / code snippets.
 */
export function PanelState({ icon = "inbox", children }: { icon?: string; children: React.ReactNode }) {
  return (
    <div role="status" className="win-flat flex flex-col items-center justify-center gap-3 min-h-[12rem] p-6 text-center">
      <div className="w-12 h-12 border-2 border-[var(--border)] grid place-items-center shrink-0">
        <PixelIcon name={icon} size={24} className="text-[var(--text-muted)]" />
      </div>
      <p className="text-base text-[var(--text-muted)] leading-snug max-w-xs">{children}</p>
    </div>
  );
}
