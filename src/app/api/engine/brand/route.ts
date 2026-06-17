import { NextResponse } from "next/server";
import { getEngineBrand } from "@/lib/engine";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → which brand foundation pieces exist (voice / positioning / icp). */
export async function GET(req: Request) {
  const clientId = new URL(req.url).searchParams.get("clientId");
  return NextResponse.json(await getEngineBrand(clientId));
}
