import { NextResponse } from "next/server";
import { runGoal, EngineOfflineError } from "@/lib/engine";
import { askClaude } from "@/lib/claude";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cheap-first router: a tiny haiku turn classifies the goal and picks the model. */
async function triageModel(goal: string): Promise<"haiku" | "sonnet" | "opus"> {
  const out = await askClaude({
    system: "Tu es un routeur de modèle. Classe la complexité de la tâche en UN seul mot : simple, moyen, ou complexe. Réponds uniquement par ce mot, sans ponctuation.",
    messages: [{ role: "user", content: goal }],
    model: "haiku",
  });
  const w = (out ?? "").toLowerCase();
  if (w.includes("complex")) return "opus";
  if (w.includes("simple")) return "haiku";
  return "sonnet";
}

/**
 * Triggered autonomy. POST { goal, clientId?, model?, permissionMode? }.
 * model can be "haiku"|"sonnet"|"opus" or "auto" (cheap-first routing).
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const goal = typeof body.goal === "string" ? body.goal.trim() : "";
  if (!goal) return NextResponse.json({ error: "goal requis" }, { status: 400 });

  let model: "haiku" | "sonnet" | "opus" | null = body.model ?? null;
  let routed = false;
  if (model === ("auto" as unknown)) {
    model = await triageModel(goal);
    routed = true;
  }

  try {
    const result = await runGoal({
      goal,
      clientId: body.clientId ?? null,
      model,
      title: body.title ?? null,
      permissionMode: body.permissionMode ?? "default",
    });
    return NextResponse.json({ ok: true, ...result, model, routed });
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
