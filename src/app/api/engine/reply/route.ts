import { NextResponse } from "next/server";
import { replyTask } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { taskId, message } → answer a task's question (resumes the headless run). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!taskId || !message) return NextResponse.json({ ok: false, error: "taskId + message requis" }, { status: 400 });
  return NextResponse.json({ ok: await replyTask(taskId, message) });
}
