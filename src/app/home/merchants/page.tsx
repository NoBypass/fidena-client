"use client"

import {useEffect, useState} from "react";
import {BankAccountDTO} from "@/app/api/bank-accounts/route";

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<BankAccountDTO[]>([])

  useEffect(() => {

  }, []);

  return (
    <>
      <header className="flex items-center w-full justify-between mb-8">
        <h1 className="font-bold text-xl">Merchants</h1>
      </header>

      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">

      </section>
    </>
  )
}