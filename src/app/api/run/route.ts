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
// Client may request these. "bypassPermissions" (disables ALL tool-permission
// prompts: shell, MCP, file writes) is intentionally NOT client-grantable — a
// caller could otherwise run an unguarded headless agent on the host. The
// dashboard's "autonomous mode" is downgraded to acceptEdits unless the operator
// opts in locally with AGENTIC_ALLOW_BYPASS=1.
const CLIENT_MODES = new Set(["default", "acceptEdits", "plan"]);
const MODELS = new Set(["haiku", "sonnet", "opus", "auto"]);

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const goal = (typeof body.goal === "string" ? body.goal.trim() : "").slice(0, 4000);
  if (!goal) return NextResponse.json({ error: "goal requis" }, { status: 400 });

  const requested: string | null = MODELS.has(body.model) ? body.model : null;
  let model: "haiku" | "sonnet" | "opus" | null = requested === "auto" ? null : (requested as "haiku" | "sonnet" | "opus" | null);
  let routed = false;
  if (requested === "auto") { model = await triageModel(goal); routed = true; }

  type PermMode = "default" | "acceptEdits" | "bypassPermissions" | "plan";
  let permissionMode = (CLIENT_MODES.has(body.permissionMode) ? body.permissionMode : "default") as PermMode;
  if (body.permissionMode === "bypassPermissions") {
    permissionMode = process.env.AGENTIC_ALLOW_BYPASS === "1" ? "bypassPermissions" : "acceptEdits";
  }
  const title = typeof body.title === "string" ? body.title.slice(0, 200) : null;
  const clientId = typeof body.clientId === "string" ? body.clientId : null;

  try {
    const result = await runGoal({ goal, clientId, model, title, permissionMode });
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
