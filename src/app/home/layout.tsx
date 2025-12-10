"use client"

import {Sidebar} from "@/components/sidebar";
import {useState} from "react";
import {BankAccount} from "@/lib/auth";

export default function Layout({
 children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all")


  return (
    <div className="flex h-screen bg-card">
      <Sidebar />
      <main className="p-6 w-full">
        {children}
      </main>
    </div>
  )
}