"use client";

import { useCallback, useEffect, useState } from "react";

export type Settings = {
  accent: string;   // hex de la couleur de marque
  scale: number;    // % d'échelle UI (85–125)
  model: string;    // modèle par défaut
};

export const ACCENT_PRESETS = [
  { name: "Bleu", hex: "#3b82f6" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Émeraude", hex: "#10b981" },
  { name: "Ambre", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Cyan", hex: "#06b6d4" },
];

export const MODELS = ["claude-opus-4-8", "claude-sonnet-4-6", "claude-haiku-4-5"];

const DEFAULT: Settings = { accent: "#e25fa0", scale: 110, model: "claude-sonnet-4-6" };
const KEY = "aios.settings";

/** Assombrit/éclaircit un hex de `amt` % (-100..100). */
function shade(hex: string, amt: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return hex;
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = amt / 100;
  if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
  else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
  return "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  // chargement
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSettings({ ...DEFAULT, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // application + persistance
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.style.setProperty("--ai-accent", settings.accent);
    root.style.setProperty("--ai-accent-2", shade(settings.accent, -18));
    root.style.fontSize = `${(16 * settings.scale) / 100}px`;
    try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings, loaded]);

  // restaure la taille de base en quittant la console
  useEffect(() => () => { document.documentElement.style.fontSize = ""; }, []);

  const update = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), []);
  const reset = useCallback(() => setSettings(DEFAULT), []);

  return { settings, update, reset };
}
