import { NextResponse } from "next/server";
import { clawHistory } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?limit= → ClaudeClaw conversation history (turns, newest first). */
export async function GET(req: Request) {
  // Clamp to a sane range: a huge or negative limit would make the upstream
  // assemble and this proxy buffer an arbitrarily large response. Missing or
  // invalid values fall back to 40.
  const n = Math.floor(Number(new URL(req.url).searchParams.get("limit")));
  const limit = Number.isFinite(n) && n > 0 ? Math.min(n, 200) : 40;
  return NextResponse.json({ turns: await clawHistory(limit) });
}
