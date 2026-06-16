import { NextResponse } from "next/server";
import { getEngineTasks } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type T = { costUsd?: number | null; tokensUsed?: number | null; model?: string | null; status?: string };

/** GET → real usage aggregated from the engine's task cost/token data. */
export async function GET() {
  const tasks = (await getEngineTasks()) as T[];
  let cost = 0, tokens = 0;
  const byModel: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  for (const t of tasks) {
    cost += t.costUsd || 0;
    tokens += t.tokensUsed || 0;
    if (t.model) byModel[t.model] = (byModel[t.model] || 0) + 1;
    if (t.status) byStatus[t.status] = (byStatus[t.status] || 0) + 1;
  }
  return NextResponse.json({ count: tasks.length, cost, tokens, byModel, byStatus });
}
