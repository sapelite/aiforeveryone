"use client";

import { useLang } from "@/lib/i18n";

/** FR/EN site language toggle. Shows the current language; click to switch. */
export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
      aria-label="Language"
      className="win-btn font-display text-[9px]"
      style={{ width: 28, height: 28 }}
    >
      {lang.toUpperCase()}
    </button>
  );
}
