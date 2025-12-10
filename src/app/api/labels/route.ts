import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db/db";
import {labels} from "@/lib/db/schema";
import {z} from "zod";
import {eq} from "drizzle-orm";

const labelsSchema = z.object({
  name: z.string(),
  color: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = labelsSchema.parse(body);

    const userId = request.headers.get("x-user-id")!;

    const [label] = await db
      .insert(labels)
      .values({
        userId,
        name: data.name,
        color: data.color,
      })
      .returning();

    return NextResponse.json({
      labelId: label.id
    })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export type LabelDTO = {
  id: number
  name: string
  color: string
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;

    const result = await db.query.labels.findMany({
      where: eq(labels.userId, userId),
    })

    return NextResponse.json(result.map(res => {
      return {
        id: res.id,
        name: res.name,
        color: res.color
      }
    }))
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
