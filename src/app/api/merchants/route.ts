import {db} from "@/lib/db/db";
import {labels, merchants, userMerchantDefaultLabels, userMerchants} from "@/lib/db/schema";
import { eq, notInArray } from 'drizzle-orm';
import {NextRequest, NextResponse} from "next/server";
import {LabelDTO} from "@/app/api/labels/route";
import {map, z} from "zod";
import {createMerchantSchema} from "@/lib/zodForms";

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
        underlyingMerchant: true,
        defaultLabels: {
          with: {
            label: true
          }
        }
      }
    })

    const referencedMerchantIds = userMerchantsData
      .map(um => um.merchantId)
      .filter(id => id !== null);

    const merchantsData = await db.query.merchants.findMany({
      where: notInArray(merchants.id, referencedMerchantIds),
    })

    const allMerchants: MerchantDTO[] = [
      ...userMerchantsData.map(um => ({
        id: um.id,
        name: um.name ?? um.underlyingMerchant?.name ?? 'Unknown Merchant',
        pfpLocation: um.pfpLocation ?? um.underlyingMerchant?.pfpLocation ?? undefined,
        color: um.color ?? um.underlyingMerchant?.color ?? undefined,
        defaultLabels: (um.defaultLabels ?? [])
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
        defaultLabels: [],
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createMerchantSchema.parse(body);

    const userId = request.headers.get("x-user-id")!;

    const defaultLabelIds = [...data.defaultLabels ?? []];

    await db.transaction(async (tx) => {
      if (data.newDefaultLabels) {
        const createdLabels = await tx.insert(labels).values(
          data.newDefaultLabels.map(l => ({
            userId,
            name: l.name,
            color: l.color,
          }))
        ).returning();

        for (const createdLabel of createdLabels) {
          defaultLabelIds.push(createdLabel.id);
        }
      }

      const [createdMerchant] = await tx.insert(userMerchants).values({
        userId,
        name: data.name,
        color: data.color,
        pfpLocation: data.pfpLocation,
      }).returning();

      await tx.insert(userMerchantDefaultLabels).values(
        defaultLabelIds.map(id => ({
          userMerchantId: createdMerchant.id,
          labelId: id,
        }))
      )
    });

    return new NextResponse(null, {status: 204})
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
