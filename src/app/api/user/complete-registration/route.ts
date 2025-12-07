import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db/db";
import {eq} from "drizzle-orm";
import {users} from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;

    const user = await db.update(users).set({ completedRegistration: true }).where(
      eq(users.id, userId)
    )

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}