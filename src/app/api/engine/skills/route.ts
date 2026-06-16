import { NextResponse } from "next/server";
import { getEngineSkills } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → installed skills, read live from the engine filesystem. */
export async function GET() {
  return NextResponse.json({ skills: await getEngineSkills() });
}
