import { engineBaseUrl } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

/**
 * Same-origin SSE proxy onto the engine's /api/events stream so the browser can
 * subscribe without cross-origin headaches. Emits an "offline" event when the
 * engine is unreachable instead of failing the connection.
 */
export async function GET() {
  const base = await engineBaseUrl();
  if (!base) return new Response(`event: offline\ndata: {"online":false}\n\n`, { headers: SSE_HEADERS });
  try {
    const upstream = await fetch(`${base}/api/events`, { headers: { Accept: "text/event-stream" } });
    if (!upstream.ok || !upstream.body) {
      return new Response(`event: offline\ndata: {"online":false}\n\n`, { headers: SSE_HEADERS });
    }
    return new Response(upstream.body, { headers: SSE_HEADERS });
  } catch {
    return new Response(`event: offline\ndata: {"online":false}\n\n`, { headers: SSE_HEADERS });
  }
}
