"use client"

import {useEffect, useState} from "react";
import {Card} from "@/components/ui/card";
import {BankAccountDTO} from "@/app/api/bank-accounts/route";
import {Separator} from "@/components/ui/separator";
import {TrendingDown, TrendingUp} from "lucide-react";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccountDTO[]>([])

  useEffect(() => {
    fetch('/api/bank-accounts')
      .then(res => res.json())
      .then(accounts => setAccounts(accounts))
      .catch(console.error)
  }, []);

  return (
    <>
      <h1 className="font-bold text-xl">Bank Accounts</h1>

      <section className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {accounts.map(account => (
          <Card key={account.id} className="p-6 gap-4">
            <header>
              <h2 className="text-lg font-semibold">{account.name}</h2>
              <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
            </header>

            <div className="flex flex-col">
              <p className="text-muted-foreground">Balance</p>
              <p className="text-2xl font-bold">{account ? new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: account.currency,
              }).format(account.balance) : ""}</p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Income</span>
                </div>
                <p className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: account.currency,
                  }).format(0)}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>Expenses</span>
                </div>
                <p className="font-semibold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: account.currency,
                  }).format(0)}
                </p>
              </div>
            </div>

            <Separator />

            <p className="text-sm text-muted-foreground">
              {0} transaction{0 !== 1 ? "s" : ""}
            </p>
          </Card>
        ))}
      </section>
    </>
  )
}