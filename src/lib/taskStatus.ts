/**
 * Client-safe task status → color mapping. Every panel that shows a status dot,
 * label or graph fill was reimplementing this with slightly different precedence
 * (some honored errorMessage, some didn't), so a failed task could render
 * inconsistently. This is the single source of truth. Presentation only — no
 * side effects, no fs/server imports (so "use client" panels can import it).
 *
 * Precedence: errorMessage > needsInput/running > done/completed > failed/error > muted.
 * Class strings are kept LITERAL (in the lookup tables below) so the Tailwind v4
 * scanner detects the arbitrary `bg-[var(--…)]` / `text-[var(--…)]` utilities.
 */
export type TaskLike = { status?: string; needsInput?: boolean | number; errorMessage?: string | null };

type Tone = "accent" | "warning" | "destructive" | "muted";

function tone(t: TaskLike): Tone {
  if (t.errorMessage) return "destructive";
  if (t.needsInput || t.status === "running") return "warning";
  if (t.status === "done" || t.status === "completed") return "accent";
  if (t.status === "failed" || t.status === "error") return "destructive";
  return "muted";
}

const DOT: Record<Tone, string> = {
  accent: "bg-[var(--accent)]",
  warning: "bg-[var(--warning)] pulse-dot",
  destructive: "bg-[var(--destructive)]",
  muted: "bg-[var(--text-muted)]",
};
const TEXT: Record<Tone, string> = {
  accent: "text-[var(--accent)]",
  warning: "text-[var(--warning)]",
  destructive: "text-[var(--destructive)]",
  muted: "text-[var(--text-muted)]",
};
const VAR: Record<Tone, string> = {
  accent: "var(--accent)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  muted: "var(--text-muted)",
};
const ICON: Record<Tone, string> = {
  accent: "check",
  warning: "clock",
  destructive: "close",
  muted: "clock",
};

/** Tailwind bg class for the status dot (pulses while running / awaiting input). */
export const statusDot = (t: TaskLike): string => DOT[tone(t)];
/** Tailwind text class for a status label. */
export const statusTextClass = (t: TaskLike): string => TEXT[tone(t)];
/** Raw CSS var for SVG fills (HiveGraph). */
export const statusVar = (t: TaskLike): string => VAR[tone(t)];
/** Pixel icon name for the status (Audit). */
export const statusIcon = (t: TaskLike): string => ICON[tone(t)];
