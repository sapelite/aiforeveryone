import { NextResponse } from "next/server";
import { clawUrl } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST → create a new ClaudeClaw text war-room meeting. Returns { meetingId }. */
export async function POST() {
  try {
    const r = await fetch(clawUrl("/api/warroom/text/new"), { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    if (!r.ok) return NextResponse.json({ ok: false, error: `claw ${r.status}` }, { status: 502 });
    return NextResponse.json(await r.json());
  } catch {
    return NextResponse.json({ ok: false, error: "ClaudeClaw injoignable" }, { status: 503 });
  }
}
