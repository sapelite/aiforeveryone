import { NextResponse } from "next/server";
import { runGoal, EngineOfflineError } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Triggered autonomy. POST { goal, clientId?, model? } → forwards the goal to the
 * Agentic OS engine, which spawns a real headless task. Returns the engine taskId
 * so the UI can subscribe to /api/events (proxied) for live streaming.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const goal = typeof body.goal === "string" ? body.goal.trim() : "";
  if (!goal) return NextResponse.json({ error: "goal requis" }, { status: 400 });

  try {
    const result = await runGoal({
      goal,
      clientId: body.clientId ?? null,
      model: body.model ?? null,
      title: body.title ?? null,
      permissionMode: body.permissionMode ?? "default",
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof EngineOfflineError) {
      return NextResponse.json(
        { ok: false, offline: true, error: "Moteur Agentic OS hors ligne. Démarre le command-centre." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 502 },
    );
  }
}
