import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Minimal modal focus management for the hand-rolled overlays (we don't route
 * them through Radix Dialog). On open it moves focus into the panel and traps
 * Tab inside it; on close it restores focus to the element that was focused
 * before. Pair with role="dialog" aria-modal="true" on the container, and give
 * the container tabIndex={-1} so it can hold focus when it has no focusables.
 * Escape-to-close is left to the caller (each modal already wires it).
 */
export function useDialogFocus<T extends HTMLElement = HTMLDivElement>(open: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    const prev = document.activeElement as HTMLElement | null;
    const focusables = node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];
    (focusables[0] ?? node)?.focus?.();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
      if (items.length === 0) { e.preventDefault(); node.focus(); return; }
      const first = items[0], last = items[items.length - 1];
      const act = document.activeElement;
      if (!node.contains(act)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && act === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && act === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      prev?.focus?.();
    };
  }, [open]);
  return ref;
}
