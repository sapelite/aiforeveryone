// Tiny 8-bit sound engine. Sounds are synthesised live with the Web Audio API
// (square-wave oscillators), so there are no audio files and nothing to license.

let ctx: AudioContext | null = null;
const KEY = "site-sound";

/* Single source of truth on `window`, shared across every route bundle.
   Lazily initialised from localStorage. Read live on each play(). */
type SoundWindow = Window & { __siteSoundOn?: boolean; webkitAudioContext?: typeof AudioContext };

function getEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as SoundWindow;
  if (typeof w.__siteSoundOn === "boolean") return w.__siteSoundOn;
  let on = true;
  try { on = localStorage.getItem(KEY) !== "off"; } catch { /* ignore */ }
  w.__siteSoundOn = on;
  return on;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as SoundWindow).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function initSound() { getEnabled(); }

export function isSoundOn() { return getEnabled(); }

export function setSoundOn(on: boolean) {
  if (typeof window !== "undefined") (window as SoundWindow).__siteSoundOn = on;
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* ignore */ }
  if (on) play("toggle");
}

function tone(c: AudioContext, freq: number, dur: number, at: number, gain = 0.04, slideTo?: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, at);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), at + dur);
  g.gain.setValueAtTime(gain, at);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

export type Sfx =
  | "click" | "open" | "close" | "min" | "max"
  | "send" | "receive" | "success" | "error" | "toggle";

export function play(kind: Sfx = "click") {
  if (!getEnabled()) return;
  const c = ensureCtx();
  if (!c) return;
  const t = c.currentTime;
  switch (kind) {
    case "click":   tone(c, 600, 0.045, t, 0.035); break;
    case "open":    tone(c, 440, 0.05, t, 0.045); tone(c, 660, 0.06, t + 0.05, 0.045); break;
    case "close":   tone(c, 520, 0.07, t, 0.045, 280); break;
    case "min":     tone(c, 420, 0.08, t, 0.045, 200); break;
    case "max":     tone(c, 480, 0.07, t, 0.045, 780); break;
    case "send":    tone(c, 680, 0.05, t, 0.04, 1000); break;
    case "receive": tone(c, 540, 0.05, t, 0.038); tone(c, 700, 0.05, t + 0.05, 0.032); break;
    case "success": tone(c, 523, 0.06, t, 0.04); tone(c, 659, 0.06, t + 0.06, 0.04); tone(c, 784, 0.09, t + 0.12, 0.04); break;
    case "error":   tone(c, 200, 0.1, t, 0.05, 150); tone(c, 150, 0.12, t + 0.1, 0.05, 110); break;
    case "toggle":  tone(c, 880, 0.06, t, 0.05); break;
  }
}
