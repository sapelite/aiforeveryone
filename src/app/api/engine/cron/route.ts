import { NextResponse } from "next/server";
import { getEngineCron, runCron, toggleCron, createCron } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → scheduled cron jobs from the engine (read-only). */
export async function GET() {
  return NextResponse.json({ jobs: await getEngineCron() });
}

/**
 * POST — manage scheduled jobs:
 *   { action: "create", name, time, days, prompt, model?, description? }
 *   { action: "run" | "toggle", slug }
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (action === "create") {
    const { name, time, days, prompt, model, description } = body;
    if (!name || !time || !days || !prompt) {
      return NextResponse.json({ ok: false, error: "name, time, days et prompt requis" }, { status: 400 });
    }
    return NextResponse.json(await createCron({ name, time, days, prompt, model, description: description ?? "" }));
  }

  const slug = body.slug as string | undefined;
  if (!slug || !action) return NextResponse.json({ ok: false, error: "slug + action requis" }, { status: 400 });
  const ok = action === "run" ? await runCron(slug) : action === "toggle" ? await toggleCron(slug) : false;
  return NextResponse.json({ ok });
}
