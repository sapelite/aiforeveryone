import { NextResponse } from "next/server";
import { loadInstance } from "@/lib/instance";
import { askClaude } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Une prise de parole d'un agent dans la war room, raisonnée par Claude
 * depuis SON persona + la business personality réelle de l'instance.
 * Claude en direct via la session Claude Code locale (abonnement Max/Pro) — pas de clé API requise.
 * Si la session n'est pas disponible → { ok:false, fallback:true } (le client génère localement).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id = "acme-corp", slug, kind = "discuss", topic = "" } = body;

  const data = await loadInstance(id);
  const agent = data.agents.find((a) => a.slug === slug);
  if (!agent) return NextResponse.json({ ok: false, fallback: true });

  const p = data.personality;
  const context = p
    ? `Entreprise : ${p.business}. ${p.summary} Fonctions dominantes : ${p.dominantFunctions.join(", ")}. Voix : ${p.traits.join(", ")}. Outils connectés : ${p.tools.map((t) => t.name).join(", ")}.`
    : `Entreprise : ${data.name}.`;

  const system = `Tu participes à la "war room" interne de ${data.name}, une réunion où chaque agent IA donne son avis depuis sa spécialité. ${context}\n\nTu es l'agent « ${agent.display} » (${agent.role}). Donne ton point de vue, ancré dans ta spécialité et distinct des autres agents, quitte à challenger. Réponds en français, 2 à 3 phrases maximum, ton direct et sans préambule. N'utilise jamais de tiret cadratin ni de double tiret. Termine par une position claire (pour, contre ou sous condition).`;

  const userText =
    kind === "standup"
      ? `Standup quotidien. En 1 à 2 phrases, résume ce que tu as accompli sur tes sujets ces dernières 24h. Ton sujet en cours : ${agent.task}.`
      : `Sujet soumis à la war room : « ${topic} ». Donne ta perspective.`;

  const text = await askClaude({ system, model: agent.model || "sonnet", messages: [{ role: "user", content: userText }] });
  if (text) return NextResponse.json({ ok: true, text, model: agent.model });
  return NextResponse.json({ ok: false, fallback: true });
}
