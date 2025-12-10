import { db } from "./db";
import { currencies } from "./schema";

const majorCurrencies = [
  { id: "USD", name: "US Dollar", symbol: "$" },
  { id: "EUR", name: "Euro", symbol: "€" },
  { id: "JPY", name: "Japanese Yen", symbol: "¥" },
  { id: "GBP", name: "British Pound", symbol: "£" },
  { id: "AUD", name: "Australian Dollar", symbol: "A$" },
  { id: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { id: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { id: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { id: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { id: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { id: "SEK", name: "Swedish Krona", symbol: "kr" },
  { id: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { id: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { id: "KRW", name: "South Korean Won", symbol: "₩" },
  { id: "INR", name: "Indian Rupee", symbol: "₹" },
  { id: "BRL", name: "Brazilian Real", symbol: "R$" },
  { id: "MXN", name: "Mexican Peso", symbol: "$" },
  { id: "ZAR", name: "South African Rand", symbol: "R" },
  { id: "RUB", name: "Russian Ruble", symbol: "₽" },
  { id: "TRY", name: "Turkish Lira", symbol: "₺" },
  { id: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { id: "SAR", name: "Saudi Riyal", symbol: "﷼" },
];

export async function ensureCurrencies() {
  const count = await db.select().from(currencies).limit(1);
  if (count.length === 0) {
    await db.insert(currencies).values(majorCurrencies).onConflictDoNothing();
    console.log("Inserted major currencies into database.");
  }
}
