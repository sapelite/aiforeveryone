import { NextResponse } from "next/server";
import { getEngineContext } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → inventory of the engine's context files (soul, user, learnings, memory). */
export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  return NextResponse.json({ files: await getEngineContext(clientId) });
}
