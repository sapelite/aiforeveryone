#!/usr/bin/env node
// @ts-check
/**
 * Connect & Understand — moteur d'ingestion de l'AI OS.
 *
 * Scanne le "stack" d'une entreprise (vault de notes, skills, agents, MCP, CLI)
 * et en dérive une **Business Personality** : fonctions dominantes, outils,
 * traits de voix, maturité, sujets clés. Écrit le profil dans l'instance client
 * (markdown + JSON consommé par la console).
 *
 * Usage :
 *   node scripts/ingest.mjs --stack scripts/sample-stack --name "Acme Corp"
 *   node scripts/ingest.mjs --stack <dir> --out clients/acme-corp --name "Acme"
 *
 * Aucune dépendance externe.
 */

import { readFile, readdir, mkdir, writeFile, stat } from "node:fs/promises";
import { join, dirname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ─── args ─── */
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      a[k] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
    }
  }
  return a;
}

const kebab = (s) =>
  String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function walk(dir) {
  if (!(await exists(dir))) return [];
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/* ─── heuristiques ─── */

// Fonctions métier → mots-clés signaux
const FUNCTIONS = {
  Ventes: ["sales", "lead", "crm", "pipeline", "deal", "prospect", "proposal", "outreach", "closing", "hubspot", "salesforce", "vente", "relance"],
  Opérations: ["ops", "process", "workflow", "automation", "automatis", "onboarding", "sop", "n8n", "logistique", "opérations"],
  Finance: ["finance", "accounting", "invoice", "facture", "stripe", "budget", "revenue", "mrr", "cashflow", "cpa", "dépense"],
  Marketing: ["marketing", "content", "contenu", "brand", "voice", "seo", "ads", "campaign", "campagne", "social", "linkedin", "meta-ads"],
  Support: ["support", "ticket", "customer", "client", "help", "faq", "zendesk", "intercom", "escalade"],
  Produit: ["product", "produit", "roadmap", "feature", "release", "spec", "design", "analytics"],
  Engineering: ["engineering", "code", "deploy", "github", "gh", "ci", "api", "infra", "gcloud"],
};

// Traits de voix → signaux
const TRAITS = {
  "data-driven": ["data-driven", "données", "kpi", "mesurable", "metric", "score"],
  "direct / sans jargon": ["direct", "sans jargon", "punchy", "concis", "court"],
  "customer-first": ["customer-first", "client", "customer", "roi", "valeur"],
  "orienté résultat": ["résultat", "result", "action", "objectif", "impact"],
  "rigoureux": ["rigueur", "process", "sop", "qualité", "discipline", "review"],
  "ambitieux": ["scale", "empire", "ambition", "croissance", "growth"],
};

const STOP = new Set("le la les de des du un une et ou à au aux en dans sur pour par avec sans nos notre votre vos ce cette ces qui que quoi on nous vous ils elles est sont a ont se son sa ses the a an of to in on for and or with our your this that is are be we you it as at by from".split(" "));

function tally(text, map) {
  const t = text.toLowerCase();
  const out = {};
  for (const [key, words] of Object.entries(map)) {
    let n = 0;
    for (const w of words) {
      const re = new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      n += (t.match(re) || []).length;
    }
    if (n) out[key] = n;
  }
  return out;
}

function merge(into, add) {
  for (const [k, v] of Object.entries(add)) into[k] = (into[k] || 0) + v;
  return into;
}

function topTerms(text, n = 8) {
  const counts = {};
  for (const raw of text.toLowerCase().match(/[a-zàâäéèêëîïôöùûüç-]{4,}/g) || []) {
    if (STOP.has(raw)) continue;
    counts[raw] = (counts[raw] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n).map(([w]) => w);
}

/* ─── main ─── */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.stack) {
    console.error("Erreur : --stack <dir> requis (le stack de l'entreprise à scanner).");
    console.error('Exemple : node scripts/ingest.mjs --stack scripts/sample-stack --name "Acme Corp"');
    process.exit(1);
  }

  const stackDir = join(ROOT, args.stack);
  const name = args.name || basename(stackDir);
  const id = kebab(name);
  const outDir = join(ROOT, args.out ?? join("clients", id));

  console.log(`\n🔎 Connect & Understand — scan du stack`);
  console.log(`   Entreprise : ${name} (${id})`);
  console.log(`   Stack      : ${relative(ROOT, stackDir)}\n`);

  /* — collecte — */
  const vaultFiles = await walk(join(stackDir, "vault"));
  const skillFiles = await walk(join(stackDir, "skills"));
  const agentFiles = await walk(join(stackDir, "agents"));

  const skills = [...new Set(skillFiles.filter((f) => f.endsWith(".md"))
    .map((f) => basename(dirname(f)) === "skills" ? basename(f, ".md") : basename(dirname(f))))];
  const agentNames = agentFiles.filter((f) => f.endsWith(".md")).map((f) => basename(f, ".md"));

  // MCP servers
  let mcp = [];
  for (const cand of [".mcp.json", "mcp.json"]) {
    const p = join(stackDir, cand);
    if (await exists(p)) {
      try {
        const j = JSON.parse(await readFile(p, "utf8"));
        mcp = Object.keys(j.mcpServers || j.servers || {});
      } catch { /* ignore */ }
      break;
    }
  }

  // CLIs
  let clis = [];
  const toolsP = join(stackDir, "tools.json");
  if (await exists(toolsP)) {
    try {
      const j = JSON.parse(await readFile(toolsP, "utf8"));
      clis = (j.clis || []).map((c) => (typeof c === "string" ? c : c.name));
    } catch { /* ignore */ }
  }

  /* — analyse — */
  let corpus = "";
  for (const f of [...vaultFiles, ...skillFiles, ...agentFiles]) {
    if (f.endsWith(".md") || f.endsWith(".txt")) corpus += "\n" + (await readFile(f, "utf8"));
  }
  corpus += " " + [...skills, ...agentNames, ...mcp, ...clis].join(" ");

  const functions = {};
  merge(functions, tally(corpus, FUNCTIONS));
  const traitsHits = tally(corpus, TRAITS);

  const dominant = Object.entries(functions).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const traits = Object.entries(traitsHits).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const topics = topTerms(corpus, 10);

  const counts = {
    notes: vaultFiles.filter((f) => f.endsWith(".md")).length,
    skills: skills.length,
    agents: agentNames.length,
    mcp: mcp.length,
    clis: clis.length,
  };
  const assets = counts.notes + counts.skills + counts.agents + counts.mcp + counts.clis;
  const maturity = assets >= 18 ? "mature" : assets >= 9 ? "en structuration" : "naissant";

  const tools = [
    ...mcp.map((n) => ({ name: n, kind: "mcp" })),
    ...clis.map((n) => ({ name: n, kind: "cli" })),
  ];

  const summary =
    `${name} est une organisation à dominante ${dominant.slice(0, 2).join(" / ") || "généraliste"}, ` +
    `de maturité « ${maturity} ». Sa voix est ${traits.slice(0, 3).join(", ") || "à préciser"}. ` +
    `Elle s'appuie sur ${tools.length} outils connectés (${tools.map((t) => t.name).slice(0, 4).join(", ")}` +
    `${tools.length > 4 ? "…" : ""}) et ${counts.skills} skills, opérés par ${counts.agents} agents existants. ` +
    `Priorités lisibles dans ses notes : ${topics.slice(0, 5).join(", ")}.`;

  const profile = {
    business: name, id, scannedAt: new Date().toISOString().slice(0, 10),
    counts, tools, skills, agents: agentNames,
    functions, dominantFunctions: dominant.slice(0, 3),
    traits, topics, maturity, summary,
  };

  /* — écriture — */
  await mkdir(join(outDir, "01-company-brain", "tools"), { recursive: true });
  await mkdir(join(outDir, "01-company-brain", "sources"), { recursive: true });

  await writeFile(join(outDir, "business-personality.json"), JSON.stringify(profile, null, 2), "utf8");

  const totalFn = Object.values(functions).reduce((a, b) => a + b, 0) || 1;
  const md = `---
type: business-personality
updated: ${profile.scannedAt}
tags: [personality, ingestion]
---

# 🧬 Business Personality — ${name}

> Profil dérivé automatiquement du stack de l'entreprise (vault, skills, agents, MCP, CLI).
> Source : \`${relative(ROOT, stackDir)}\` · scanné le ${profile.scannedAt}.

## En une phrase
${summary}

## Fonctions dominantes
${dominant.map((f) => `- **${f}** — ${Math.round((functions[f] / totalFn) * 100)}% des signaux`).join("\n") || "- (non déterminé)"}

## Voix & traits
${traits.map((t) => `- ${t}`).join("\n") || "- (à préciser)"}

## Maturité du système
**${maturity}** — ${assets} actifs détectés (${counts.notes} notes · ${counts.skills} skills · ${counts.agents} agents · ${counts.mcp} MCP · ${counts.clis} CLI).

## Outils connectés
${tools.map((t) => `- \`${t.name}\` (${t.kind})`).join("\n") || "- (aucun détecté)"}

## Sujets clés (vault)
${topics.map((t) => `\`${t}\``).join(" · ")}

---
*Ce profil alimente le company-brain et la console. Re-scanner après toute évolution du stack.*
`;
  await writeFile(join(outDir, "business-personality.md"), md, "utf8");

  // fiches outils
  for (const t of tools) {
    await writeFile(
      join(outDir, "01-company-brain", "tools", `${kebab(t.name)}.md`),
      `---\ntype: tool\nupdated: ${profile.scannedAt}\ntags: [tool, ${t.kind}]\nstatus: active\nentity-id: ${kebab(t.name)}\n---\n\n# Outil — ${t.name}\n\nDétecté à l'ingestion (${t.kind}). Connecté à l'AI OS de ${name}.\n`,
      "utf8"
    );
  }

  // log de source
  await writeFile(
    join(outDir, "01-company-brain", "sources", `ingestion-${profile.scannedAt}.md`),
    `---\ntype: source\nupdated: ${profile.scannedAt}\norigin: ${relative(ROOT, stackDir)}\n---\n\n# Source — Ingestion du stack (${profile.scannedAt})\n\nFichiers scannés : ${vaultFiles.length + skillFiles.length + agentFiles.length}.\nMCP : ${mcp.join(", ") || "—"}.\nCLI : ${clis.join(", ") || "—"}.\nSkills : ${skills.join(", ") || "—"}.\nAgents : ${agentNames.join(", ") || "—"}.\n`,
    "utf8"
  );

  /* — rapport console — */
  console.log(`🧬 Business Personality`);
  console.log(`   Dominantes : ${dominant.slice(0, 3).join(", ") || "—"}`);
  console.log(`   Traits     : ${traits.slice(0, 3).join(", ") || "—"}`);
  console.log(`   Maturité   : ${maturity} (${assets} actifs)`);
  console.log(`   Outils     : ${tools.map((t) => t.name).join(", ") || "—"}`);
  console.log(`\n✅ Profil écrit dans ${relative(ROOT, outDir)} (business-personality.md + .json)\n`);
}

main().catch((e) => { console.error("❌ Échec de l'ingestion :", e.message); process.exit(1); });
