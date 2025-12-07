import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db/db";
import {users} from "@/lib/db/schema";
import {eq} from "drizzle-orm";

export async function GET(request: NextRequest,) {
  try {
    const userId = request.headers.get("x-user-id")!;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}