import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

/* Real, persisted task store — one tasks.json per client instance. */

export type TaskStatus = "queued" | "running" | "blocked" | "done";
export type TaskPrio = "high" | "med" | "low";

export type Task = {
  id: string;
  title: string;
  agent: string; // agent display name, or "" for unassigned
  status: TaskStatus;
  prio: TaskPrio;
  createdAt: number;
  updatedAt: number;
};

const CLIENTS = path.join(process.cwd(), "clients");
const fileFor = (id: string) => path.join(CLIENTS, id, "tasks.json");

/** Starter tasks — written once to disk on first read, then fully editable/persisted. */
function seed(): Task[] {
  const now = Date.now();
  const min = 60_000;
  const base: Array<[string, string, TaskStatus, TaskPrio, number]> = [
    ["Qualifier 12 nouveaux leads entrants", "Ventes", "running", "high", 4],
    ["Générer le rapport hebdo · S23", "Reporting", "running", "med", 12],
    ["Préparer la proposition Umbrella", "Ventes", "running", "high", 25],
    ["Débloquer le ticket critique Soylent", "Support", "blocked", "high", 60],
    ["Auditer le process d'onboarding", "Opérations", "queued", "med", 90],
    ["Relancer Initech — sans contact 15j", "Ventes", "queued", "med", 120],
    ["Revue trimestrielle · Globex", "Stratège", "queued", "low", 240],
    ["Synthèse réunion produit", "Support", "done", "low", 130],
  ];
  return base.map(([title, agent, status, prio, ageMin]) => ({
    id: randomUUID(), title, agent, status, prio,
    createdAt: now - ageMin * min, updatedAt: now - ageMin * min,
  }));
}

export async function readTasks(id: string): Promise<Task[]> {
  try {
    const raw = JSON.parse(await fs.readFile(fileFor(id), "utf8"));
    return Array.isArray(raw) ? raw : [];
  } catch {
    const s = seed();
    await writeTasks(id, s);
    return s;
  }
}

export async function writeTasks(id: string, tasks: Task[]): Promise<void> {
  await fs.mkdir(path.join(CLIENTS, id), { recursive: true });
  await fs.writeFile(fileFor(id), JSON.stringify(tasks, null, 2), "utf8");
}

export function newTask(input: Partial<Task>): Task {
  const now = Date.now();
  return {
    id: randomUUID(),
    title: (input.title ?? "").trim() || "Nouvelle tâche",
    agent: input.agent ?? "",
    status: (input.status as TaskStatus) ?? "queued",
    prio: (input.prio as TaskPrio) ?? "med",
    createdAt: now,
    updatedAt: now,
  };
}

/** Relative-time label, e.g. "il y a 4 min". */
export function ago(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60_000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}
