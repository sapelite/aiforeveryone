import { NextResponse } from "next/server";
import { readEngineSkill } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET ?name= → the SKILL.md content of one skill. */
export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get("name") ?? "";
  if (!name) return NextResponse.json({ content: null });
  return NextResponse.json({ content: await readEngineSkill(name) });
}
