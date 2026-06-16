import { NextResponse } from "next/server";
import { previewFile } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?path= → text preview of a produced file (binaries are flagged). */
export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get("path") ?? "";
  if (!path) return NextResponse.json({ content: null, truncated: false, extension: "", binary: false });
  return NextResponse.json((await previewFile(path)) ?? { content: null, truncated: false, extension: "", binary: false });
}
