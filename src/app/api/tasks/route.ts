import { NextResponse } from "next/server";
import { readTasks, writeTasks, newTask, type Task, type TaskStatus, type TaskPrio } from "@/lib/tasks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES: TaskStatus[] = ["queued", "running", "blocked", "done"];
const PRIOS: TaskPrio[] = ["high", "med", "low"];

/* GET ?id= → all tasks */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "acme-corp";
  return NextResponse.json({ ok: true, tasks: await readTasks(id) });
}

/* POST → create {id, title, agent?, status?, prio?} */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body.id ?? "acme-corp";
  if (!body.title || !String(body.title).trim()) return NextResponse.json({ error: "titre requis" }, { status: 400 });

  const tasks = await readTasks(id);
  const task = newTask({ title: body.title, agent: body.agent, status: body.status, prio: body.prio });
  tasks.unshift(task);
  await writeTasks(id, tasks);
  return NextResponse.json({ ok: true, task });
}

/* PATCH → update {id, taskId, title?, agent?, status?, prio?} */
export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  const id = body.id ?? "acme-corp";
  const taskId = body.taskId;
  if (!taskId) return NextResponse.json({ error: "taskId requis" }, { status: 400 });

  const tasks = await readTasks(id);
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return NextResponse.json({ error: "tâche introuvable" }, { status: 404 });

  if (typeof body.title === "string" && body.title.trim()) t.title = body.title.trim();
  if (typeof body.agent === "string") t.agent = body.agent;
  if (STATUSES.includes(body.status)) t.status = body.status;
  if (PRIOS.includes(body.prio)) t.prio = body.prio;
  t.updatedAt = Date.now();

  await writeTasks(id, tasks);
  return NextResponse.json({ ok: true, task: t });
}

/* DELETE ?id=&taskId= */
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "acme-corp";
  const taskId = url.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId requis" }, { status: 400 });

  const tasks = await readTasks(id);
  const next: Task[] = tasks.filter((x) => x.id !== taskId);
  await writeTasks(id, next);
  return NextResponse.json({ ok: true, removed: tasks.length - next.length });
}
