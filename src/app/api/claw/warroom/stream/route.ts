import { clawUrl } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OFFLINE = () => new Response("event: offline\ndata: {}\n\n", { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform" } });

/** SSE proxy onto a ClaudeClaw war-room meeting stream (token injected server-side). */
export async function GET(req: Request) {
  const meetingId = new URL(req.url).searchParams.get("meetingId") ?? "";
  if (!meetingId) return OFFLINE();
  try {
    const upstream = await fetch(clawUrl("/api/warroom/text/stream", { meetingId, sinceSeq: "0" }), { headers: { Accept: "text/event-stream" } });
    if (!upstream.ok || !upstream.body) return OFFLINE();
    return new Response(upstream.body, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
    });
  } catch {
    return OFFLINE();
  }
}
