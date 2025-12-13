import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db/db";
import {MerchantDTO} from "@/app/api/merchants/route";

export async function GET(request: NextRequest) {
  try {
    const merchantsData = await db.query.merchants.findMany({
      with: { defaultLabels: { with: { label: true} } }
    })

    const merchants: MerchantDTO[] = merchantsData.map(m => ({
      id: m.id,
      name: m.name,
      pfpLocation: m.pfpLocation ?? undefined,
      color: m.color ?? undefined,
      defaultLabels: (m.defaultLabels ?? [])
        .map(l => ({
          id: l.label.id,
          name: l.label.name,
          color: l.label.color
        }))
    }));

    return NextResponse.json(merchants)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}