import { promises as fs } from "fs";
import path from "path";
import { readTasks, ago } from "./tasks";
import { safeId } from "./ids";

/* ════════════════════════════════════════════════
   Couche de données — lit clients/<id>/ sur le disque.
   Les champs "live" (personality, agents, memoryCounts)
   viennent du système de fichiers ; le runtime (tasks,
   workflows, kg, décisions) est curé ici pour rester
   une seule source pour la console.
═══════════════════════════════════════════════════ */

const CLIENTS = path.join(process.cwd(), "clients");

export type Personality = {
  business: string;
  id: string;
  scannedAt: string;
  counts: { notes: number; skills: number; agents: number; mcp: number; clis: number };
  tools: { name: string; kind: string }[];
  skills: string[];
  agents: string[];
  functions: Record<string, number>;
  dominantFunctions: string[];
  traits: string[];
  topics: string[];
  maturity: string;
  summary: string;
};

export type AgentInfo = {
  slug: string;
  display: string;
  role: string;
  model: string;
  description: string;
  status: "online" | "killed";
  task: string;
  load: "low" | "med" | "high";
};

export type Status = "running" | "queued" | "blocked" | "done";

export type InstanceData = {
  id: string;
  name: string;
  personality: Personality | null;
  agents: AgentInfo[];
  memoryCounts: { cat: string; n: number; last: string }[];
  tasks: { id: string; title: string; agent: string; status: Status; prio: "high" | "med" | "low"; when: string }[];
  workflows: { name: string; trigger: string; next: string; status: Status }[];
  entities: { id: string; type: string; label: string }[];
  relations: string[];
  decisions: { date: string; title: string; who: string }[];
  alerts: { level: "red" | "amber"; text: string }[];
};

/* ─── helpers fs ─── */
async function exists(p: string) {
  try { await fs.stat(p); return true; } catch { return false; }
}
async function readJson<T>(p: string): Promise<T | null> {
  try { return JSON.parse(await fs.readFile(p, "utf8")) as T; } catch { return null; }
}

/* ─── agents : lus depuis 03-agents/*.md + agent-state.json ─── */
const KNOWN: Record<string, { display: string; role: string }> = {
  "strategist-agent": { display: "Stratège", role: "Stratégie & décision" },
  "operations-agent": { display: "Opérations", role: "Process & automatisation" },
  "sales-agent": { display: "Ventes", role: "Pipeline & propositions" },
  "reporting-agent": { display: "Reporting", role: "KPI & synthèses" },
  "support-agent": { display: "Support", role: "Clients & capitalisation" },
};

const CURATED_TASK: Record<string, { task: string; load: AgentInfo["load"] }> = {
  "strategist-agent": { task: "Revue trimestrielle Globex (en file)", load: "low" },
  "operations-agent": { task: "Audit du process onboarding", load: "med" },
  "sales-agent": { task: "Qualification de 12 leads", load: "high" },
  "reporting-agent": { task: "Génération rapport S23", load: "med" },
  "support-agent": { task: "Ticket Soylent — escalade Ops", load: "high" },
};

type AgentState = {
  status?: Record<string, "online" | "killed">;
  meta?: Record<string, { display?: string; role?: string; model?: string; description?: string; task?: string }>;
};

const titleCase = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

async function loadAgents(base: string): Promise<AgentInfo[]> {
  const dir = path.join(base, "03-agents");
  const state = (await readJson<AgentState>(path.join(base, "agent-state.json"))) ?? {};
  let files: string[] = [];
  if (await exists(dir)) {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md") && !f.startsWith("_") && f.toLowerCase() !== "readme.md");
  }
  return files.map((f) => {
    const slug = f.replace(/\.md$/, "");
    const known = KNOWN[slug];
    const meta = state.meta?.[slug] ?? {};
    const curated = CURATED_TASK[slug];
    return {
      slug,
      display: meta.display ?? known?.display ?? titleCase(slug),
      role: meta.role ?? known?.role ?? "Agent personnalisé",
      model: meta.model ?? "claude-sonnet-4-6",
      description: meta.description ?? "",
      status: state.status?.[slug] ?? "online",
      task: meta.task ?? curated?.task ?? "En attente d'instructions",
      load: curated?.load ?? "low",
    };
  });
}

/* ─── mémoires : compte les fiches du company-brain ─── */
const MEM_CATS: { dir: string; cat: string }[] = [
  { dir: "identity", cat: "Identité" },
  { dir: "offers", cat: "Offres" },
  { dir: "customers", cat: "Clients" },
  { dir: "positioning", cat: "Positionnement" },
  { dir: "team", cat: "Équipe" },
  { dir: "tools", cat: "Outils" },
  { dir: "processes", cat: "Processus" },
  { dir: "decisions", cat: "Décisions" },
];

async function countMemories(base: string) {
  const out: { cat: string; n: number; last: string }[] = [];
  for (const { dir, cat } of MEM_CATS) {
    const full = path.join(base, "01-company-brain", dir);
    if (!(await exists(full))) continue;
    const files = (await fs.readdir(full)).filter(
      (f) => f.endsWith(".md") && !f.startsWith("_template") && f.toLowerCase() !== "readme.md"
    );
    if (files.length) out.push({ cat, n: files.length, last: files[files.length - 1].replace(/\.md$/, "") });
  }
  return out;
}

/* ─── runtime curé (état d'exécution, hors fichiers template) ─── */
const RUNTIME = {
  workflows: [
    { name: "Reporting hebdo", trigger: "Cron · lundi 08:00", next: "dans 2 j", status: "running" as Status },
    { name: "Brief interne", trigger: "Cron · chaque matin", next: "demain 08:00", status: "running" as Status },
    { name: "Suivi commercial", trigger: "Webhook · nouveau lead", next: "événementiel", status: "running" as Status },
    { name: "Onboarding client", trigger: "Webhook · client signé", next: "événementiel", status: "running" as Status },
    { name: "Revue de projet", trigger: "Jalon atteint", next: "en attente", status: "queued" as Status },
    { name: "Aide à la décision", trigger: "À la demande", next: "—", status: "done" as Status },
  ],
  entities: [
    { id: "marie-dupont", type: "person", label: "Marie Dupont" },
    { id: "globex", type: "customer", label: "Globex" },
    { id: "initech", type: "customer", label: "Initech" },
    { id: "umbrella", type: "customer", label: "Umbrella" },
    { id: "soylent", type: "customer", label: "Soylent" },
    { id: "hubspot", type: "tool", label: "HubSpot" },
    { id: "slack", type: "tool", label: "Slack" },
    { id: "q2-automation", type: "project", label: "Automatisation reporting Q2" },
  ],
  relations: [
    "marie-dupont  →[manages]→  equipe-ops",
    "acme-corp  →[uses]→  hubspot",
    "acme-corp  →[serves]→  globex",
    "q2-automation  →[depends-on]→  google-sheets",
  ],
  decisions: [
    { date: "2026-06-02", title: "Migrer le reporting hebdo vers l'AI OS", who: "Marie Dupont" },
    { date: "2026-05-18", title: "Prioriser la qualification de leads (Q2)", who: "Comité direction" },
    { date: "2026-05-04", title: "Adopter HubSpot comme CRM unique", who: "Thomas Bernard" },
  ],
  alerts: [
    { level: "red" as const, text: "Soylent — ticket critique ouvert depuis 9 jours sans résolution." },
    { level: "amber" as const, text: "Initech — aucun contact depuis 15 jours, risque de refroidissement." },
  ],
};

/* ─── point d'entrée ─── */
export async function loadInstance(id = "acme-corp"): Promise<InstanceData> {
  id = safeId(id);
  const base = path.join(CLIENTS, id);
  const personality = await readJson<Personality>(path.join(base, "business-personality.json"));
  const agentsRaw = await loadAgents(base);
  const agents = agentsRaw.length ? agentsRaw : fallbackAgents();
  const memoryCounts = await countMemories(base);

  // real, persisted tasks (clients/<id>/tasks.json)
  const rawTasks = await readTasks(id);
  const tasks = rawTasks.map((t) => ({
    id: t.id, title: t.title, agent: t.agent, status: t.status as Status,
    prio: t.prio as "high" | "med" | "low", when: ago(t.updatedAt || t.createdAt),
  }));
  // derive each agent's current task + load from the real task list
  for (const a of agents) {
    const mine = rawTasks.filter((t) => t.agent === a.display && t.status !== "done");
    const active = mine.find((t) => t.status === "running") ?? mine[0];
    a.task = active ? active.title : "Aucune tâche active";
    a.load = mine.length >= 3 ? "high" : mine.length === 2 ? "med" : "low";
  }

  return {
    id,
    name: personality?.business ?? "Acme Corp",
    personality,
    agents,
    memoryCounts: memoryCounts.length ? memoryCounts : fallbackMemories(),
    tasks,
    ...RUNTIME,
  };
}

/* ─── fallback si l'instance n'existe pas ─── */
function fallbackAgents(): AgentInfo[] {
  return Object.entries(KNOWN).map(([slug, k]) => ({
    slug, display: k.display, role: k.role, model: "claude-sonnet-4-6", description: "",
    status: "online", task: CURATED_TASK[slug]?.task ?? "—", load: CURATED_TASK[slug]?.load ?? "low",
  }));
}
function fallbackMemories() {
  return [
    { cat: "Identité", n: 1, last: "company-identity" },
    { cat: "Clients", n: 5, last: "soylent" },
    { cat: "Outils", n: 8, last: "stripe" },
  ];
}
