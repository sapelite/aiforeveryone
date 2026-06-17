import { NextResponse } from "next/server";
import { clawSend } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST { message } → send a message through ClaudeClaw (reply via SSE). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 4000) : "";
  if (!message) return NextResponse.json({ ok: false, error: "message requis" }, { status: 400 });
  return NextResponse.json(await clawSend(message));
}
