import { NextResponse } from "next/server";
import { clawUrl } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST → abort ClaudeClaw's current processing (chat turn). */
export async function POST() {
  try {
    const r = await fetch(clawUrl("/api/chat/abort"), { method: "POST" });
    return NextResponse.json(await r.json().catch(() => ({ ok: r.ok })), { status: r.status });
  } catch {
    return NextResponse.json({ ok: false, error: "ClaudeClaw injoignable" }, { status: 503 });
  }
}
