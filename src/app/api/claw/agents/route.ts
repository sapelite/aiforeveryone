import { NextResponse } from "next/server";
import { clawAgents } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → the real ClaudeClaw agent roster (main + configured agents). */
export async function GET() {
  return NextResponse.json({ agents: await clawAgents() });
}
