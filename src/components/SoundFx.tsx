"use client";

import { useEffect } from "react";
import { initSound, play, type Sfx } from "@/lib/sound";

// Plays a pixel blip whenever an interactive element is clicked, site-wide.
// An element can override the default with data-sfx="open|close|min|..."
const SELECTOR = "button, a, [role=button], .pbtn, .win-btn, summary, select, label, input[type=checkbox], input[type=color], [data-sfx]";

export default function SoundFx() {
  useEffect(() => {
    initSound();
    const onDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest) return;
      const sfxEl = target.closest("[data-sfx]");
      if (sfxEl) { play((sfxEl.getAttribute("data-sfx") as Sfx) || "click"); return; }
      if (target.closest(SELECTOR)) play("click");
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
