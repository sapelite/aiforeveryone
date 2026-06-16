import Anthropic from "@anthropic-ai/sdk";

export type ClaudeTurn = { role: "user" | "assistant"; content: string };

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
    const response = query({
      prompt,
      options: { systemPrompt: system, model, tools: [], settingSources: [], maxTurns: 1 },
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
