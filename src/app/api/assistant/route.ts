import { NextResponse } from "next/server";
import { askClaude, type ClaudeTurn as Turn } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Connaissance produit (français) — sert au prompt système et au fallback hors-ligne. */
const KB = `AI For Everyone construit des systèmes d'exploitation IA (AI OS) sur mesure pour les entreprises B2B.
Comment ça marche : (1) Audit gratuit via un formulaire, (2) Architecture sur mesure, (3) Construction et ingestion de vos données, (4) Déploiement et suivi. Compter environ 6 semaines.
Ce que l'AI OS inclut : des agents autonomes spécialisés, des workflows intelligents, des dashboards décisionnels, un "Brain" (un vault Obsidian vivant qui centralise et maintient votre connaissance), et des intégrations via MCP (Google Drive, Sheets, Slack, Notion, HubSpot, Stripe, GitHub, et plus).
Tarifs : Starter 2 900 €/mois (3 agents, 5 workflows, Brain de base), Business 5 900 €/mois (10 agents, workflows illimités, Brain avancé, support prioritaire), Enterprise sur mesure (agents illimités, hébergement dédié, SLA).
Sécurité : vos données restent les vôtres, hébergement dédié possible, conformité RGPD.
Pour commencer : l'audit est gratuit, il suffit de remplir le formulaire d'onboarding.`;

function fallback(message: string): string {
  const m = message.toLowerCase();
  if (/(prix|tarif|coût|cout|combien|abonnement|formule)/.test(m))
    return "Trois formules : Starter à 2 900 €/mois, Business à 5 900 €/mois, et Enterprise sur mesure. L'audit de départ est gratuit, vous pouvez le lancer depuis le formulaire.";
  if (/(comment|marche|fonctionne|étapes|etapes|process)/.test(m))
    return "Quatre étapes : audit gratuit, architecture sur mesure, construction avec ingestion de vos données, puis déploiement et suivi. Comptez environ 6 semaines.";
  if (/(brain|obsidian|vault|mémoire|memoire|connaissance)/.test(m))
    return "Le Brain est un vault Obsidian vivant. Il centralise toute votre connaissance, reliée et interrogeable, et vos agents la tiennent à jour en continu.";
  if (/(intégrat|integrat|connect|mcp|slack|drive|notion|hubspot|outil)/.test(m))
    return "On connecte vos outils via MCP : Google Drive, Sheets, Slack, Notion, HubSpot, Stripe, GitHub, et même des serveurs MCP sur mesure. Vos agents y ont un accès en lecture, et en écriture validée.";
  if (/(démo|demo|essai|gratuit|commencer|rendez|contact|parler)/.test(m))
    return "L'audit est gratuit. Remplissez le formulaire d'onboarding, l'équipe revient sous 48h avec une architecture sur mesure.";
  return "Je peux vous renseigner sur le fonctionnement, les tarifs, le Brain, les intégrations ou l'audit gratuit. Qu'est-ce qui vous intéresse ?";
}

const SYSTEM = `Tu es Clio, l'assistante du site d'AI For Everyone. Tu parles français, simplement et directement, comme quelqu'un de l'équipe. Va droit au but : 2 ou 3 phrases courtes. Pas de formules toutes faites, pas d'enthousiasme forcé, pas d'emojis. N'utilise jamais de tiret cadratin ni de double tiret, sers-toi de virgules ou de points. Réponds à la question posée sans en rajouter. Si tu ne sais pas, dis-le et propose de contacter l'équipe.\n\n${KB}`;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const messages = (body.messages ?? []) as Turn[];
  const last = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // Claude en direct via l'abonnement (Claude Agent SDK) — pas de clé API requise.
  const text = await askClaude({ system: SYSTEM, messages: messages.slice(-12) });
  if (text) return NextResponse.json({ ok: true, text, live: true });

  // Repli local si la session Claude n'est pas disponible (hors-ligne, non connecté…).
  return NextResponse.json({ ok: true, text: fallback(last), live: false });
}
