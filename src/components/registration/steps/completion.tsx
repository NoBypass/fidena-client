"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Sparkles } from "lucide-react"
import {BankAccount, RegistrationType} from "@/lib/auth";

interface CompletionStepProps {
  registrationType: RegistrationType
  accounts: BankAccount[]
}

export function CompletionStep({ registrationType, accounts }: CompletionStepProps) {
  const totalBalance = accounts.reduce((sum, account) => {
    const balance = Number.parseFloat(account.balance.replace(/[^0-9.-]+/g, ""))
    return sum + (isNaN(balance) ? 0 : balance)
  }, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  return (
    <Card className="p-8 md:p-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 relative">
          <CheckCircle2 className="w-10 h-10 text-accent" />
          <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-balance">{"You're"} All Set!</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto text-pretty leading-relaxed">
            Your SecureBank account has been created successfully
          </p>
        </div>

        {/* Summary */}
        <div className="space-y-4 pt-4">
          <div className="p-6 rounded-xl bg-secondary/50 border text-left">
            <h3 className="font-semibold mb-4">Account Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Authentication Method</span>
                <span className="font-medium">
                  {registrationType === "webauthn" ? "Passkey (Biometric)" : "Email & Password"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Connected Accounts</span>
                <span className="font-medium">{accounts.length}</span>
              </div>

              <div className="flex justify-between pt-3 border-t">
                <span className="text-muted-foreground">Total Balance</span>
                <span className="font-bold text-lg text-accent">{formatCurrency(totalBalance)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">🔒 Your data is encrypted.</span> All account information
              is protected with end-to-end encryption and stored securely.
            </p>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button
            size="lg"
            className="w-full md:w-auto px-8 bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => window.location.reload()}
          >
            Go to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground">{"You'll"} receive a confirmation email shortly</p>
        </div>
      </div>
    </Card>
  )
}
