import { NextResponse } from "next/server";
import { loadInstance } from "@/lib/instance";
import { askClaude, type ClaudeTurn as Turn } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Chat avec l'AI OS de l'instance, ancré dans sa business personality.
 * Claude en direct via la session Claude Code locale (abonnement Max/Pro) — pas de clé API requise.
 * Si la session n'est pas disponible → { ok:false, fallback:true } (l'UI affiche un avis).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { id = "acme-corp", messages = [] as Turn[] } = body;

  if (!Array.isArray(messages) || messages.length === 0)
    return NextResponse.json({ ok: false, error: "messages requis" }, { status: 400 });

  const data = await loadInstance(id);
  const p = data.personality;
  const context = p
    ? `${p.summary} Fonctions dominantes : ${p.dominantFunctions.join(", ")}. Voix de marque : ${p.traits.join(", ")}. Outils : ${p.tools.map((t) => t.name).join(", ")}. Agents : ${data.agents.map((a) => a.display).join(", ")}.`
    : `Entreprise : ${data.name}.`;

  const system = `Tu es l'AI OS de ${data.name}, le système d'exploitation IA central de l'entreprise. Tu connais son contexte : ${context} Tu réponds en français, simplement et directement, sans formules toutes faites ni emojis. N'utilise jamais de tiret cadratin ni de double tiret. Appuie-toi sur ce que tu sais de l'entreprise. Si une information manque, dis-le au lieu d'inventer.`;

  const text = await askClaude({ system, messages: (messages as Turn[]).slice(-20) });
  if (text) return NextResponse.json({ ok: true, text });
  return NextResponse.json({ ok: false, fallback: true });
}
