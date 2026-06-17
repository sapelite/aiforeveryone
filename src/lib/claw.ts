/**
 * Client for ClaudeClaw OS (the entry / nervous-system layer).
 *
 * The pixel shell talks to ClaudeClaw's token-gated Hono dashboard API over HTTP
 * to surface its channels (Telegram / WhatsApp / Slack) as the Inbox window. The
 * DASHBOARD_TOKEN is injected SERVER-SIDE only (in the /api/claw/* proxies) and is
 * never exposed to the browser.
 *
 * Env:
 *   CLAUDECLAW_URL   - base URL of the ClaudeClaw dashboard (default http://127.0.0.1:3141)
 *   CLAUDECLAW_TOKEN - DASHBOARD_TOKEN required on every ClaudeClaw API call
 */

const CLAW_URL = (process.env.CLAUDECLAW_URL || "http://127.0.0.1:3141").replace(/\/+$/, "");
const CLAW_TOKEN = process.env.CLAUDECLAW_TOKEN || "";

/** Build an authed ClaudeClaw URL (token added as ?token=, plus optional params). */
export function clawUrl(path: string, params?: Record<string, string>): string {
  const u = new URL(`${CLAW_URL}${path}`);
  if (CLAW_TOKEN) u.searchParams.set("token", CLAW_TOKEN);
  if (params) for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  return u.toString();
}

export type ClawStatus = { online: boolean; telegramConnected?: boolean; waConnected?: boolean; model?: string };

export async function clawStatus(): Promise<ClawStatus> {
  try {
    const r = await fetch(clawUrl("/api/health"), { signal: AbortSignal.timeout(3000) });
    if (!r.ok) return { online: false };
    const j = (await r.json()) as Record<string, unknown>;
    return { online: true, telegramConnected: !!j.telegramConnected, waConnected: !!j.waConnected, model: typeof j.model === "string" ? j.model : undefined };
  } catch {
    return { online: false };
  }
}

export type ClawTurn = { id: number; role: string; content: string; created_at: number };

export async function clawHistory(limit = 40): Promise<ClawTurn[]> {
  try {
    const r = await fetch(clawUrl("/api/chat/history", { limit: String(limit) }), { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return [];
    const j = (await r.json()) as { turns?: ClawTurn[] };
    return Array.isArray(j.turns) ? j.turns : [];
  } catch {
    return [];
  }
}

export type ClawAgent = { id: string; name: string; description: string; model: string; running: boolean; todayTurns: number; todayCost: number };

export async function clawAgents(): Promise<ClawAgent[]> {
  try {
    const r = await fetch(clawUrl("/api/agents"), { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return [];
    const j = (await r.json()) as { agents?: ClawAgent[] };
    return Array.isArray(j.agents) ? j.agents : [];
  } catch {
    return [];
  }
}

export async function clawSend(message: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch(clawUrl("/api/chat/send"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(8000),
    });
    if (r.ok) return { ok: true };
    const j = (await r.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: j.error ?? `erreur ${r.status}` };
  } catch {
    return { ok: false, error: "ClaudeClaw injoignable" };
  }
}
