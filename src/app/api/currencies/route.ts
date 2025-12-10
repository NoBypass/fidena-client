import {db} from "@/lib/db/db";
import {NextResponse} from "next/server";

export async function GET() {
  const currencies = await db.query.currencies.findMany();
  return NextResponse.json(currencies)
}