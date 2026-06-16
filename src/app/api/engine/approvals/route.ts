import { NextResponse } from "next/server";
import { listApprovals, resolveApproval, type ApprovalDecision } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?taskId= → pending approval requests for a task. */
export async function GET(req: Request) {
  const taskId = new URL(req.url).searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ approvals: [] });
  return NextResponse.json({ approvals: await listApprovals(taskId) });
}

/** POST { taskId, requestId, decision } → resolve an approval. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { taskId, requestId, decision } = body as { taskId?: string; requestId?: string; decision?: ApprovalDecision };
  if (!taskId || !requestId || !decision) {
    return NextResponse.json({ ok: false, error: "taskId, requestId, decision requis" }, { status: 400 });
  }
  return NextResponse.json({ ok: await resolveApproval(taskId, requestId, decision) });
}
