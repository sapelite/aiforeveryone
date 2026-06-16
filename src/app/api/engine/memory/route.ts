import { NextResponse } from "next/server";
import { readEngineMemory } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → the engine's living memory documents (MEMORY.md, today's log, learnings, SOUL). */
export async function GET() {
  return NextResponse.json({ docs: await readEngineMemory() });
}
