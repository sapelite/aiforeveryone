import { NextResponse } from "next/server";
import { getEngineCron } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → scheduled cron jobs from the engine (read-only). */
export async function GET() {
  return NextResponse.json({ jobs: await getEngineCron() });
}
