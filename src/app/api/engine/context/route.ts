import { NextResponse } from "next/server";
import { getEngineContext } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → inventory of the engine's context files (soul, user, learnings, memory). */
export async function GET() {
  return NextResponse.json({ files: await getEngineContext() });
}
