import { NextResponse } from "next/server";
import { getEngineProjects, getRecentFiles } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → engine projects (briefs with progress) and recently produced files. */
export async function GET() {
  const [projects, files] = await Promise.all([getEngineProjects(), getRecentFiles(16)]);
  return NextResponse.json({ projects, files });
}
