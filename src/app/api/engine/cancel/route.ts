import { NextResponse } from "next/server";
import { cancelTask } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { taskId } → cancel a running task (kills the headless process). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const taskId = typeof body.taskId === "string" ? body.taskId : "";
  if (!taskId) return NextResponse.json({ ok: false, error: "taskId requis" }, { status: 400 });
  return NextResponse.json({ ok: await cancelTask(taskId) });
}
