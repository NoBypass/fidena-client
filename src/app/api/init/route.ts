import {ensureCurrencies} from "@/lib/db/seed";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
  await ensureCurrencies();
  return NextResponse.json({ok: true})
}