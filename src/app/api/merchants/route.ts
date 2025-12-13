import {db} from "@/lib/db/db";
import {merchants, userMerchants} from "@/lib/db/schema";
import { eq, notInArray } from 'drizzle-orm';
import {NextRequest, NextResponse} from "next/server";
import {LabelDTO} from "@/app/api/labels/route";

export type MerchantDTO= {
  id: number
  name: string
  pfpLocation?: string
  color?: string
  defaultLabels?: LabelDTO[]
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;

    // TODO add recently used merchants to the top of the list
    const userMerchantsData = await db.query.userMerchants.findMany({
      where: eq(userMerchants.userId, userId),
      with: {
        underlyingMerchant: {
          with: {
            defaultLabels: {
              with: {
                label: true
              }
            }
          }
        },
        defaultLabels: {
          with: {
            label: true
          }
        }
      }
    })

    const referencedMerchantIds = userMerchantsData.map(um => um.merchantId);

    const merchantsData = await db.query.merchants.findMany({
      where: notInArray(merchants.id, referencedMerchantIds),
      with: { defaultLabels: { with: { label: true} } }
    })

    const allMerchants: MerchantDTO[] = [
      ...userMerchantsData.map(um => ({
        id: um.id,
        name: um.name ?? um.underlyingMerchant?.name ?? 'Unknown Merchant',
        pfpLocation: um.pfpLocation ?? um.underlyingMerchant?.pfpLocation ?? undefined,
        color: um.color ?? um.underlyingMerchant?.color ?? undefined,
        defaultLabels: (um.defaultLabels ?? um.underlyingMerchant?.defaultLabels ?? [])
          .map(l => ({
            id: l.label.id,
            name: l.label.name,
            color: l.label.color
          }))
      })),
      ...merchantsData.map(m => ({
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
      }))
    ];

    return NextResponse.json(allMerchants)
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
