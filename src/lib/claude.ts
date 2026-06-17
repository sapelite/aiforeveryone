import Anthropic from "@anthropic-ai/sdk";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join, dirname } from "path";

export type ClaudeTurn = { role: "user" | "assistant"; content: string };

/**
 * On Windows, the Agent SDK has to find the `claude` executable; the npm shim
 * (claude.cmd / bare sh script) is not directly spawnable, which makes the SDK
 * fail and the chat fall back to demo mode. Resolve the real claude.exe so we can
 * hand the SDK an explicit path. Returns undefined on POSIX (the SDK finds it fine).
 */
let cachedClaudeExe: string | null | undefined;
function resolveClaudeExe(): string | undefined {
  if (process.platform !== "win32") return undefined;
  if (cachedClaudeExe !== undefined) return cachedClaudeExe ?? undefined;
  try {
    const out = spawnSync("where", ["claude"], { encoding: "utf8", windowsHide: true }).stdout || "";
    for (const shim of out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
      const exe = join(dirname(shim), "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe");
      if (existsSync(exe)) { cachedClaudeExe = exe; return exe; }
    }
  } catch { /* ignore */ }
  cachedClaudeExe = null;
  return undefined;
}

/** Map model alias / full id to a valid Anthropic API model id. */
function toApiModel(m: string): string {
  if (m.startsWith("claude-")) return m;
  const map: Record<string, string> = { sonnet: "claude-sonnet-4-6", opus: "claude-opus-4-8", haiku: "claude-haiku-4-5" };
  return map[m] ?? "claude-sonnet-4-6";
}

/**
 * Pose une question à Claude. Deux chemins, transparents pour l'appelant :
 *
 *  1. Si ANTHROPIC_API_KEY est défini (ex. en production sur Vercel), on utilise
 *     l'API Anthropic standard (facturation au token). C'est le seul chemin qui
 *     marche sur un serveur.
 *  2. Sinon (dev local), on utilise la session Claude Code locale via le Claude
 *     Agent SDK (abonnement Max/Pro, pas de clé API).
 *
 * Renvoie le texte, ou null si aucun chemin n'aboutit (l'appelant gère le repli).
 */
export async function askClaude(opts: {
  system: string;
  messages: ClaudeTurn[];
  model?: string;
}): Promise<string | null> {
  const { system, messages, model = "sonnet" } = opts;
  const clean = messages.filter((m) => m && m.content && m.content.trim());
  const last = [...clean].reverse().find((m) => m.role === "user")?.content?.trim();
  if (!last) return null;

  // 1) Production / serveur : API Anthropic via clé.
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const msg = await client.messages.create({
        model: toApiModel(model),
        max_tokens: 1024,
        system,
        messages: clean.slice(-20).map((m) => ({ role: m.role, content: m.content })),
      });
      const text = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("")
        .trim();
      return text || null;
    } catch {
      /* tombe sur le chemin abonnement si dispo, sinon null */
    }
  }

  // 2) Dev local : session Claude Code (abonnement). Import dynamique pour ne pas
  //    embarquer le SDK lourd dans les fonctions serverless qui n'en ont pas besoin.
  try {
    const { query } = await import("@anthropic-ai/claude-agent-sdk");
    const history = clean.slice(0, -1);
    const prior = history.length
      ? history.map((m) => `${m.role === "user" ? "Utilisateur" : "Assistant"} : ${m.content}`).join("\n") + "\n\n"
      : "";
    const prompt = `${prior}Utilisateur : ${last}`;
    const exe = resolveClaudeExe();
    const response = query({
      prompt,
      options: { systemPrompt: system, model, tools: [], settingSources: [], maxTurns: 1, ...(exe ? { pathToClaudeCodeExecutable: exe } : {}) },
    });
    let text = "";
    for await (const m of response) {
      if (m.type === "result" && m.subtype === "success") text = m.result;
    }
    text = text.trim();
    return text || null;
  } catch {
    return null;
  }
}
