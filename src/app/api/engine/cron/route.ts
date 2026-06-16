import { NextResponse } from "next/server";
import { getEngineCron, runCron, toggleCron } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → scheduled cron jobs from the engine (read-only). */
export async function GET() {
  return NextResponse.json({ jobs: await getEngineCron() });
}

/** POST { slug, action: "run" | "toggle" } → trigger or pause a scheduled job. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { slug, action } = body as { slug?: string; action?: "run" | "toggle" };
  if (!slug || !action) return NextResponse.json({ ok: false, error: "slug + action requis" }, { status: 400 });
  const ok = action === "run" ? await runCron(slug) : action === "toggle" ? await toggleCron(slug) : false;
  return NextResponse.json({ ok });
}
