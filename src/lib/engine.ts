import { promises as fs } from "fs";
import path from "path";

/**
 * Client for the Agentic OS engine (the cloned `agenticdenoob` command-centre).
 *
 * The product is the SHELL; the engine is the autonomous runtime. We never spawn
 * `claude -p` from here — we call the engine's existing HTTP API and read its SSE
 * event stream. The engine is the single source of truth for execution state.
 *
 * Discovery: the engine writes its live port to `<workspace>/.command-centre/port`
 * on startup (command-centre/src/instrumentation.ts). We read that to find it.
 * Everything degrades gracefully to "offline" when the engine is not running.
 *
 * Env overrides:
 *   AGENTIC_OS_DIR        - path to the engine workspace (default: ../agenticdenoob)
 *   AGENTIC_OS_ENGINE_URL - full base URL, bypassing the port file
 */

const ENGINE_DIR =
  process.env.AGENTIC_OS_DIR || path.resolve(process.cwd(), "..", "agenticdenoob");
const PORT_FILE = path.join(ENGINE_DIR, ".command-centre", "port");

export class EngineOfflineError extends Error {
  constructor(message = "Le moteur Agentic OS est hors ligne.") {
    super(message);
    this.name = "EngineOfflineError";
  }
}

/** Resolve the engine base URL from env or the port file. Null if not discoverable. */
export async function engineBaseUrl(): Promise<string | null> {
  const override = process.env.AGENTIC_OS_ENGINE_URL;
  if (override) return override.replace(/\/+$/, "");
  try {
    const port = (await fs.readFile(PORT_FILE, "utf8")).trim();
    if (!/^\d+$/.test(port)) return null;
    return `http://127.0.0.1:${port}`;
  } catch {
    return null;
  }
}

async function engineFetch(p: string, init?: RequestInit): Promise<Response> {
  const base = await engineBaseUrl();
  if (!base) throw new EngineOfflineError();
  return fetch(`${base}${p}`, init);
}

export type EngineStatus = {
  online: boolean;
  baseUrl: string | null;
  workspace: string;
  port: number | null;
};

/** Health probe. Hits a cheap GET and reports connectivity. */
export async function engineStatus(): Promise<EngineStatus> {
  const baseUrl = await engineBaseUrl();
  const port = baseUrl ? Number(baseUrl.split(":").pop()) || null : null;
  if (!baseUrl) return { online: false, baseUrl: null, workspace: ENGINE_DIR, port: null };
  try {
    const res = await fetch(`${baseUrl}/api/clients`, { signal: AbortSignal.timeout(2500) });
    return { online: res.ok, baseUrl, workspace: ENGINE_DIR, port };
  } catch {
    return { online: false, baseUrl, workspace: ENGINE_DIR, port };
  }
}

export type RunOptions = {
  goal: string;
  clientId?: string | null;
  model?: "haiku" | "sonnet" | "opus" | null;
  title?: string | null;
};
export type RunResult = { taskId: string; conversationId: string; title: string };

/**
 * Triggered autonomy: turn a free-text goal into a real headless engine task.
 * Creates a conversation, then posts the goal as a message; the engine's
 * queue-watcher dispatches it to a headless `claude -p` run. Returns the taskId
 * so the caller can subscribe to /api/events for live streaming.
 *
 * clientId defaults to null (the root workspace) until onboarding wires real
 * per-tenant workspaces under clients/<id>/.
 */
export async function runGoal(opts: RunOptions): Promise<RunResult> {
  const clientId = opts.clientId ?? null;

  const convRes = await engineFetch("/api/chat/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, title: opts.title ?? null }),
  });
  if (!convRes.ok) throw new Error(`engine: création de conversation (${convRes.status})`);
  const conv = (await convRes.json()) as { id: string };

  const msgRes = await engineFetch("/api/chat/message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId: conv.id, content: opts.goal, model: opts.model ?? null }),
  });
  if (!msgRes.ok) throw new Error(`engine: envoi du message (${msgRes.status})`);
  const out = (await msgRes.json()) as { task: { id: string; title: string } | null };
  if (!out.task) throw new Error("engine: aucune tâche créée");

  return { taskId: out.task.id, conversationId: conv.id, title: out.task.title };
}

/* ─── read-through helpers (used by later phases; safe, read-only) ─── */
export async function getEngineTasks(clientId?: string | null): Promise<unknown[]> {
  try {
    const q = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
    const res = await engineFetch(`/api/tasks${q}`);
    return res.ok ? ((await res.json()) as unknown[]) : [];
  } catch { return []; }
}
export async function getEngineSkills(): Promise<unknown[]> {
  try {
    const res = await engineFetch("/api/skills");
    return res.ok ? ((await res.json()) as unknown[]) : [];
  } catch { return []; }
}
export async function getEngineCron(): Promise<unknown[]> {
  try {
    const res = await engineFetch("/api/cron");
    return res.ok ? ((await res.json()) as unknown[]) : [];
  } catch { return []; }
}
