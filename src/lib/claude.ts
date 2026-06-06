import { query, type Options } from "@anthropic-ai/claude-agent-sdk";

export type ClaudeTurn = { role: "user" | "assistant"; content: string };

/**
 * Pose une question à Claude via le Claude Agent SDK.
 *
 * Auth : utilise la session Claude Code locale (~/.claude/.credentials.json),
 * c.-à-d. ton abonnement Max/Pro — aucune clé API ni facturation au token.
 * Si `ANTHROPIC_API_KEY` est défini dans l'environnement, le sous-processus
 * l'utilisera à la place (facturation API). Sinon → abonnement.
 *
 * Pur chat : aucun outil, aucun réglage global (MCP/hooks) chargé, 1 seul tour.
 * Renvoie le texte de la réponse, ou `null` si indisponible (l'appelant gère le repli).
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

  // Transcript compact des tours précédents → contexte (endpoint sans état).
  const history = clean.slice(0, -1);
  const prior = history.length
    ? history.map((m) => `${m.role === "user" ? "Utilisateur" : "Assistant"} : ${m.content}`).join("\n") + "\n\n"
    : "";
  const prompt = `${prior}Utilisateur : ${last}`;

  const options: Options = {
    systemPrompt: system,
    model,
    tools: [],            // pur chat — aucun outil, donc aucune demande de permission
    settingSources: [],   // isolation : ignore settings/MCP/hooks/CLAUDE.md de l'utilisateur
    maxTurns: 1,
  };

  try {
    const response = query({ prompt, options });
    let text = "";
    for await (const msg of response) {
      if (msg.type === "result" && msg.subtype === "success") text = msg.result;
    }
    text = text.trim();
    return text || null;
  } catch {
    return null;
  }
}
