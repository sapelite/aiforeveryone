import { NextResponse } from "next/server";
import { clawUrl } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?meetingId= → transcript + roster of a war-room meeting. */
export async function GET(req: Request) {
  const meetingId = new URL(req.url).searchParams.get("meetingId") ?? "";
  if (!meetingId) return NextResponse.json({ error: "meetingId requis" }, { status: 400 });
  try {
    const r = await fetch(clawUrl("/api/warroom/text/history", { meetingId }));
    return NextResponse.json(await r.json(), { status: r.status });
  } catch {
    return NextResponse.json({ error: "ClaudeClaw injoignable" }, { status: 503 });
  }
}
