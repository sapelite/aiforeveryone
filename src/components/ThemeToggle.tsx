"use client";

import { useEffect, useState } from "react";
import { PixelIcon } from "@/components/PixelIcon";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const el = document.documentElement;
    el.classList.toggle("dark", next === "dark");
    el.classList.toggle("light", next === "light");
    try { localStorage.setItem("site-theme", next); } catch { /* ignore */ }
  }

  return (
    <button
      onClick={toggle}
      aria-label="Changer de thème"
      title={theme === "dark" ? "Mode jour" : "Mode CRT"}
      className="grid place-items-center w-8 h-8 border-2 border-[var(--border)] text-[var(--text)] hover:bg-[var(--accent)] hover:text-[#1b1b1b] transition-colors"
    >
      <PixelIcon name={theme === "dark" ? "sun" : "moon"} size={16} />
    </button>
  );
}
