import { NextResponse } from "next/server";
import { engineStatus } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → is the Agentic OS engine reachable, and where. */
export async function GET() {
  return NextResponse.json(await engineStatus());
}
