import { NextResponse } from "next/server";
import { getEngineTaskHistory } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED = ["limit", "offset", "status", "type", "projectSlug", "dateRange", "sortBy", "sortDir", "clientId"];

/** GET → filtered/sorted/paginated task history from the engine. */
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const opts: Record<string, string> = {};
  for (const k of ALLOWED) { const v = sp.get(k); if (v) opts[k] = v; }
  return NextResponse.json(await getEngineTaskHistory(opts));
}
