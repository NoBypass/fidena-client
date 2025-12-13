"use client"

import {useEffect, useState} from "react";
import TransactionsTable from "@/app/home/transactions/transactionsTable";
import {Button} from "@/components/ui/button";
import {Dialog, DialogTrigger} from "@/components/ui/dialog";
import {TransactionDTO} from "@/app/api/transaction/route";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionDTO[]>([])

  useEffect(() => {

  }, []);

  return (
    <>
      <header className="flex items-center w-full justify-between mb-8">
        <h1 className="font-bold text-xl">Transactions</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">+ Register Transaction</Button>
          </DialogTrigger>
        </Dialog>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TransactionsTable transactions={transactions} />
      </section>
    </>
  )
}