import { NextResponse } from "next/server";
import { getTaskLogs, getTaskOutputs } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?taskId= → a task's logs (agent output) and produced files. */
export async function GET(req: Request) {
  const taskId = new URL(req.url).searchParams.get("taskId") ?? "";
  if (!taskId) return NextResponse.json({ logs: [], outputs: [] });
  const [logs, outputs] = await Promise.all([getTaskLogs(taskId), getTaskOutputs(taskId)]);
  return NextResponse.json({ logs, outputs });
}
