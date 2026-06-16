"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";
import { initSound, isSoundOn, setSoundOn } from "@/lib/sound";

export default function SoundToggle() {
  const [on, setOn] = useState(true);

  useEffect(() => { initSound(); setOn(isSoundOn()); }, []);

  function toggle() {
    const next = !on;
    setOn(next);
    setSoundOn(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={on ? "Couper le son" : "Activer le son"}
      title={on ? "Couper le son" : "Activer le son"}
      className="grid place-items-center w-8 h-8 border-2 border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-[#1b1b1b] transition-colors"
    >
      <PixelIcon name={on ? "volume-2" : "volume-x"} size={16} />
    </button>
  );
}
