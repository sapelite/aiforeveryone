import { NextResponse } from "next/server";
import { clawStatus } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → ClaudeClaw connectivity (online + telegram/whatsapp connected). */
export async function GET() {
  return NextResponse.json(await clawStatus());
}
