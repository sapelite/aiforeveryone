import { NextResponse } from "next/server";
import { engineBaseUrl, isUnsafeRelPath } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?path= → stream a produced file from the engine as a download. */
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams.get("path") ?? "";
  if (isUnsafeRelPath(p)) return NextResponse.json({ error: "chemin invalide" }, { status: 400 });
  const base = await engineBaseUrl();
  if (!base) return NextResponse.json({ error: "moteur hors ligne" }, { status: 503 });

  const upstream = await fetch(`${base}/api/files/download?path=${encodeURIComponent(p)}`).catch(() => null);
  if (!upstream || !upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "fichier introuvable" }, { status: upstream?.status ?? 502 });
  }
  // Sanitize the fallback filename: strip separators, quotes and control chars so
  // a crafted path cannot break out of the quoted Content-Disposition value.
  const safeName = (p.split(/[\\/]/).pop() || "file").replace(/["\r\n\x00-\x1f]/g, "") || "file";
  const headers = new Headers();
  headers.set("Content-Disposition", upstream.headers.get("content-disposition") ?? `attachment; filename="${safeName}"`);
  headers.set("Content-Type", upstream.headers.get("content-type") ?? "application/octet-stream");
  return new NextResponse(upstream.body, { headers });
}
