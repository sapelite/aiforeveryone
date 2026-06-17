import { NextResponse } from "next/server";
import { clawHistory } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?limit= → ClaudeClaw conversation history (turns, newest first). */
export async function GET(req: Request) {
  const limit = Number(new URL(req.url).searchParams.get("limit")) || 40;
  return NextResponse.json({ turns: await clawHistory(limit) });
}
