#!/usr/bin/env node
// @ts-check
/**
 * Instancie l'AI OS d'un client à partir des réponses du formulaire d'onboarding.
 *
 * Lit un JSON (mêmes champs que src/app/onboarding/page.tsx), copie
 * `client-ai-os-template/` vers `clients/<company-id>/`, et remplace tous les
 * tokens {{...}} par les valeurs du client (+ tokens dérivés : date, IDs).
 *
 * Usage :
 *   node scripts/instantiate.mjs --input scripts/sample-acme.json
 *   node scripts/instantiate.mjs --input data.json --out clients/acme --template client-ai-os-template
 *
 * Aucune dépendance externe.
 */

import { readFile, mkdir, readdir, writeFile, copyFile, stat } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/* ─── args ─── */
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = val;
    }
  }
  return args;
}

/* ─── helpers ─── */
const kebab = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents (combining diacritical marks)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const arr = (v) => (Array.isArray(v) ? v.join(", ") : v ?? "");

const todayISO = () => new Date().toISOString().slice(0, 10);

/** Construit la table de remplacement {{TOKEN}} -> valeur. */
function buildTokens(form) {
  const companyId = kebab(form.company);
  const contactId = kebab(form.contactName || form.email?.split("@")[0]);
  return {
    COMPANY_NAME: form.company ?? "",
    WEBSITE: form.website ?? "",
    INDUSTRY: form.industry ?? "",
    EMPLOYEE_COUNT: form.employees ?? "",
    TEAM_SIZE: form.teamSize ?? "",
    PRIMARY_CONTACT: form.contactName ?? form.email ?? "",
    CONTACT_ROLE: form.role ?? "",
    CONTACT_EMAIL: form.email ?? "",
    CONTACT_PHONE: form.phone ?? "",
    PROCESSES: form.processes ?? "",
    PAIN_POINTS: form.painPoints ?? "",
    AUTOMATION_AREAS: arr(form.automationAreas),
    TOOLS: arr(form.tools),
    GOALS: form.goals ?? "",
    TIMELINE: form.timeline ?? "",
    BUDGET: form.budget ?? "",
    // dérivés
    INSTANCIATION_DATE: todayISO(),
    COMPANY_ID: companyId,
    PRIMARY_CONTACT_ID: contactId,
  };
}

/** Remplace tous les {{TOKEN}} connus dans un texte. */
function applyTokens(text, tokens) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(tokens, name) ? tokens[name] : match
  );
}

/** Liste récursivement tous les fichiers d'un dossier. */
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const TEXT_EXT = new Set([".md", ".markdown", ".txt", ".yml", ".yaml", ".json"]);
const isText = (f) => TEXT_EXT.has(f.slice(f.lastIndexOf(".")).toLowerCase());

/* ─── main ─── */
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input) {
    console.error("Erreur : --input <fichier.json> requis.");
    console.error("Exemple : node scripts/instantiate.mjs --input scripts/sample-acme.json");
    process.exit(1);
  }

  const templateDir = join(ROOT, args.template ?? "client-ai-os-template");
  const form = JSON.parse(await readFile(join(ROOT, args.input), "utf8"));
  const tokens = buildTokens(form);
  const outDir = join(ROOT, args.out ?? join("clients", tokens.COMPANY_ID));

  console.log(`\n🏗️  Instanciation de l'AI OS`);
  console.log(`   Client    : ${tokens.COMPANY_NAME} (${tokens.COMPANY_ID})`);
  console.log(`   Template  : ${relative(ROOT, templateDir)}`);
  console.log(`   Sortie    : ${relative(ROOT, outDir)}\n`);

  const files = await walk(templateDir);
  let written = 0;
  const unresolved = new Set();

  for (const src of files) {
    const rel = relative(templateDir, src);
    const dest = join(outDir, rel);
    await mkdir(dirname(dest), { recursive: true });

    if (isText(src)) {
      const replaced = applyTokens(await readFile(src, "utf8"), tokens);
      // détecter les tokens d'instanciation non résolus (ignore les {{À RENSEIGNER}} volontaires)
      for (const m of replaced.matchAll(/\{\{([A-Z_]+)\}\}/g)) unresolved.add(m[1]);
      await writeFile(dest, replaced, "utf8");
    } else {
      await copyFile(src, dest);
    }
    written++;
  }

  console.log(`✅ ${written} fichiers générés dans ${relative(ROOT, outDir)}`);
  if (unresolved.size) {
    console.warn(`⚠️  Tokens non résolus (à vérifier) : ${[...unresolved].join(", ")}`);
  }
  console.log(
    `\n👉 Prochaine étape : compléter les champs « À RENSEIGNER » et ingérer les sources du client.\n`
  );
}

main().catch((err) => {
  console.error("❌ Échec de l'instanciation :", err.message);
  process.exit(1);
});
