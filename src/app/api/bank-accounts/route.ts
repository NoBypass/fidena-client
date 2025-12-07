import {NextRequest, NextResponse} from "next/server";
import {z} from "zod";
import {db} from "@/lib/db/db";
import {bankAccounts} from "@/lib/db/schema";
import {and, eq} from "drizzle-orm";

const bankAccountSchema = z.object({
  name: z.string(),
  accountNumber: z.string().optional(),
  balance: z.number(),
  currency: z.string()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bankAccountSchema.parse(body);

    const userId = request.headers.get("x-user-id")!;

    const [bankAccount] = await db
      .insert(bankAccounts)
      .values({
        userId,
        name: data.name,
        accountNumber: data.accountNumber,
        initialBalance: data.balance,
        defaultCurrency: data.currency
      })
      .returning();

    return NextResponse.json({
      bankAccountId: bankAccount.id
    })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")!;

    const accounts = await db.query.bankAccounts.findMany({
      where: eq(bankAccounts.userId, userId),
    })

    return NextResponse.json(accounts.map(a => ({
      id: a.id,
      name: a.name,
      accountNumber: a.accountNumber,
      balance: a.initialBalance,
      currency: a.defaultCurrency
    })))
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
