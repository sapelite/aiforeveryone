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

export type EnginePermissionMode = "default" | "acceptEdits" | "bypassPermissions" | "plan";
export type RunOptions = {
  goal: string;
  clientId?: string | null;
  model?: "haiku" | "sonnet" | "opus" | null;
  title?: string | null;
  permissionMode?: EnginePermissionMode;
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
    body: JSON.stringify({ conversationId: conv.id, content: opts.goal, model: opts.model ?? null, permissionMode: opts.permissionMode ?? "default" }),
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

/* ─── approval guardrail ─── */
export type ApprovalDecision = "allow_once" | "allow_for_task" | "deny";
export type ApprovalRequest = {
  id: string; taskId: string; status: string; title: string;
  description: string | null; toolName: string; inputJson: string; createdAt: string;
};

export async function listApprovals(taskId: string): Promise<ApprovalRequest[]> {
  try {
    const res = await engineFetch(`/api/tasks/${encodeURIComponent(taskId)}/approval-requests`);
    return res.ok ? ((await res.json()) as ApprovalRequest[]) : [];
  } catch { return []; }
}

export async function resolveApproval(taskId: string, requestId: string, decision: ApprovalDecision): Promise<boolean> {
  try {
    const res = await engineFetch(
      `/api/tasks/${encodeURIComponent(taskId)}/approval-requests/${encodeURIComponent(requestId)}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision }) },
    );
    return res.ok;
  } catch { return false; }
}

/** Free-text reply to a task that asked the user a question (completes the interactive loop). */
export async function replyTask(taskId: string, message: string): Promise<boolean> {
  try {
    const res = await engineFetch(`/api/tasks/${encodeURIComponent(taskId)}/reply`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }),
    });
    return res.ok;
  } catch { return false; }
}

/** Cancel a running task (kills the headless claude process). */
export async function cancelTask(taskId: string): Promise<boolean> {
  try { return (await engineFetch(`/api/tasks/${encodeURIComponent(taskId)}/cancel`, { method: "POST" })).ok; }
  catch { return false; }
}

/* ─── scheduled jobs (cron) actions ─── */
export async function runCron(slug: string): Promise<boolean> {
  try { return (await engineFetch(`/api/cron/${encodeURIComponent(slug)}/run`, { method: "POST" })).ok; }
  catch { return false; }
}
export async function toggleCron(slug: string): Promise<boolean> {
  try { return (await engineFetch(`/api/cron/${encodeURIComponent(slug)}/toggle`, { method: "PATCH" })).ok; }
  catch { return false; }
}

export type CronInput = { name: string; time: string; days: string; prompt: string; model?: string; description?: string };
export async function createCron(input: CronInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await engineFetch("/api/cron", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
    if (res.ok) return { ok: true };
    const j = await res.json().catch(() => ({}));
    return { ok: false, error: (j as { error?: string }).error ?? `erreur ${res.status}` };
  } catch { return { ok: false, error: "moteur hors ligne" }; }
}

/* ─── engine living memory (read-only disk surface) ─── */
export type MemoryDoc = { name: string; path: string; content: string; updatedAt: string | null };

async function readDoc(rel: string): Promise<MemoryDoc | null> {
  try {
    const p = path.join(ENGINE_DIR, rel);
    const content = await fs.readFile(p, "utf8");
    const stat = await fs.stat(p);
    return { name: path.basename(rel), path: rel.replace(/\\/g, "/"), content: content.slice(0, 24000), updatedAt: stat.mtime.toISOString() };
  } catch { return null; }
}

export async function readEngineMemory(): Promise<MemoryDoc[]> {
  const docs: (MemoryDoc | null)[] = [await readDoc("context/MEMORY.md")];
  try {
    const memDir = path.join(ENGINE_DIR, "context", "memory");
    const files = (await fs.readdir(memDir)).filter((f) => f.endsWith(".md")).sort();
    if (files.length) docs.push(await readDoc(`context/memory/${files[files.length - 1]}`));
  } catch { /* no memory dir */ }
  docs.push(await readDoc("context/learnings.md"));
  docs.push(await readDoc("context/SOUL.md"));
  return docs.filter((d): d is MemoryDoc => d !== null);
}

/** Read a single skill's SKILL.md content by its folder name. */
export async function readEngineSkill(name: string): Promise<string | null> {
  const safe = name.replace(/[^a-z0-9_-]/gi, "");
  if (!safe) return null;
  const doc = await readDoc(`.claude/skills/${safe}/SKILL.md`);
  return doc?.content ?? null;
}

/* ─── task inspection (logs + produced files) ─── */
export type TaskLogEntry = { id: string; type: string; timestamp: string; content: string; toolName?: string };
export type TaskOutputFile = { id: string; fileName: string; relativePath: string; extension: string; sizeBytes: number | null };

export async function getTaskLogs(taskId: string): Promise<TaskLogEntry[]> {
  try {
    const res = await engineFetch(`/api/tasks/${encodeURIComponent(taskId)}/logs`);
    return res.ok ? ((await res.json()) as TaskLogEntry[]) : [];
  } catch { return []; }
}
export async function getTaskOutputs(taskId: string): Promise<TaskOutputFile[]> {
  try {
    const res = await engineFetch(`/api/tasks/${encodeURIComponent(taskId)}/outputs`);
    return res.ok ? ((await res.json()) as TaskOutputFile[]) : [];
  } catch { return []; }
}
