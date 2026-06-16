import { NextResponse } from "next/server";
import { getEngineTasks } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?clientId= → live task board from the engine (read-only). */
export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  return NextResponse.json({ tasks: await getEngineTasks(clientId) });
}
