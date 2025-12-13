"use client"

import {useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Building2 } from "lucide-react"
import {BankAccount} from "@/lib/auth";
import {CurrencySelect, Currency} from "@/components/currencySelect";

interface AccountsStepProps {
  onNext: () => void
  onBack: () => void
  setRegisteredAccounts: (accounts: BankAccount[]) => void
}

interface ServerBankAccount {
  id: number
  name: string
  accountNumber: string
  balance: number
  currency: string
}

export function AccountsStep({ onNext, onBack, setRegisteredAccounts }: AccountsStepProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>()
  const [newAccount, setNewAccount] = useState({
    name: "",
    accountNumber: "",
    balance: "",
  })

  const addAccount = async () => {
    if (newAccount.name && newAccount.balance && selectedCurrency) {
      const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`
      const optimisticAccount = {
        ...newAccount,
        currency: selectedCurrency.id,
      }

      setAccounts([...accounts, {
        ...optimisticAccount,
        id: tempId,
      }])
      setNewAccount({ name: "", accountNumber: "", balance: "" })

      try {
        const response = await fetch("/api/bank-accounts", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...optimisticAccount,
            balance: parseFloat(optimisticAccount.balance),
          }),
        })

        if (!response.ok) throw new Error("Unable to add account")
        const { bankAccountId } = await response.json()

        setAccounts(prev => prev.map(a => (a.id === tempId ? { ...a, id: bankAccountId } : a)))
      } catch (e) {
        setAccounts(accounts.filter((account) => account.id !== tempId))
      }
    }
  }

  const removeAccount = (id: string|number) => {
    setAccounts(accounts.filter((account) => account.id !== id))
    if (typeof id === "number") {
      fetch(`/api/bank-accounts/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  useEffect(() => {
    fetch("/api/bank-accounts", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.json())
      .then(accounts => setAccounts(accounts
        .map((a: ServerBankAccount) => ({ ...a, balance: a.balance.toString() }))))
      .catch(console.error)
  }, [])

  useEffect(() => {
    setRegisteredAccounts(accounts)
  }, [accounts, setRegisteredAccounts]);

  const formatCurrency = (value: string, currency: string) => {
    const number = Number.parseFloat(value.replace(/[^0-9.-]+/g, ""))
    if (isNaN(number)) return ""
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(number)
  }

  return (
    <Card className="p-8 md:p-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Add Your Bank Accounts</h2>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            {"Let's"} add your existing accounts to get started
          </p>
        </div>

        {/* Existing Accounts */}
        {accounts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Your Accounts</h3>
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Building2 className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{account.name}</p>
                    <p className="text-sm text-muted-foreground">••••{account.accountNumber.slice(-4)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-lg">{formatCurrency(account.balance, account.currency)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAccount(account.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Account Form */}
        <div className="space-y-4 p-6 rounded-xl bg-muted/30 border-2 border-dashed">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Account
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                placeholder="e.g., Main Checking"
                value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                placeholder="e.g., 123456789"
                value={newAccount.accountNumber}
                onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            {/*TODO replace with MoneyField component*/}
            <Label htmlFor="balance">Current Balance</Label>
            <Input
              id="balance"
              type="number"
              startContent={
                <p className="text-muted-foreground text-sm">{selectedCurrency?.symbol || ""}</p>
              }
              endContent={
                <CurrencySelect
                  selectedCurrency={selectedCurrency}
                  setSelectedCurrency={setSelectedCurrency}
                  className="focus:outline-none border-none shadow-none hover:bg-transparent hover:text-foreground text-muted-foreground" />
              }
              placeholder="0.00"
              value={newAccount.balance}
              onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
            />
          </div>

          <Button
            onClick={addAccount}
            disabled={!newAccount.name || !newAccount.balance || !selectedCurrency}
            variant="outline"
            className="w-full bg-transparent"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button onClick={onBack} variant="outline" className="flex-1 bg-transparent">
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={accounts.length === 0}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Continue
          </Button>
        </div>
      </div>
    </Card>
  )
}
