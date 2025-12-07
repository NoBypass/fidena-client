import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db/db";
import {bankAccounts} from "@/lib/db/schema";
import {and, eq} from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get("x-user-id")!;

    const existing = await db.query.bankAccounts.findFirst({
      where: and(
        eq(bankAccounts.id, id),
        eq(bankAccounts.userId, userId)
      ),
    })

    if (!existing) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 })
    }

    await db.delete(bankAccounts).where(eq(bankAccounts.id, id)).execute()
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}