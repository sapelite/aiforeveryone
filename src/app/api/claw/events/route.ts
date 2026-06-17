import { clawUrl } from "@/lib/claw";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OFFLINE = () =>
  new Response("event: offline\ndata: {}\n\n", { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform" } });

/** SSE proxy onto ClaudeClaw's chat stream (token injected server-side). */
export async function GET(req: Request) {
  try {
    const upstream = await fetch(clawUrl("/api/chat/stream"), { headers: { Accept: "text/event-stream" }, signal: req.signal });
    if (!upstream.ok || !upstream.body) return OFFLINE();
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch {
    return OFFLINE();
  }
}
