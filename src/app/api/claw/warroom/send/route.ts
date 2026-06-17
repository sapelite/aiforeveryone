import { NextResponse } from "next/server";
import { clawUrl } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { meetingId, text, clientMsgId } → send a turn into the war-room meeting. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const meetingId = typeof body.meetingId === "string" ? body.meetingId : "";
  const text = typeof body.text === "string" ? body.text.trim().slice(0, 8000) : "";
  const clientMsgId = typeof body.clientMsgId === "string" ? body.clientMsgId : "";
  if (!meetingId || !text || !clientMsgId) return NextResponse.json({ error: "meetingId, text, clientMsgId requis" }, { status: 400 });
  try {
    const r = await fetch(clawUrl("/api/warroom/text/send"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, text, clientMsgId }),
    });
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
  } catch {
    return NextResponse.json({ error: "ClaudeClaw injoignable" }, { status: 503 });
  }
}
