import { NextResponse } from "next/server";
import { getEngineBrand } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → which brand foundation pieces exist (voice / positioning / icp). */
export async function GET() {
  return NextResponse.json(await getEngineBrand());
}
