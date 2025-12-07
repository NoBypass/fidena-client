"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Shield, Lock, Fingerprint } from "lucide-react"

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <Card className="p-8 md:p-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10">
          <Shield className="w-10 h-10 text-accent" />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-balance">Welcome to Fidena</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto text-pretty leading-relaxed">
            {"Let's"} set up your account with bank-grade encryption and security in just a few steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
            <Lock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-sm mb-1">End-to-End Encryption</h3>
              <p className="text-xs text-muted-foreground">Your data is encrypted on your device</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50">
            <Fingerprint className="w-5 h-5 text-accent mt-0.5 shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-sm mb-1">Biometric Security</h3>
              <p className="text-xs text-muted-foreground">Sign in with your fingerprint or face</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onNext}
          size="lg"
          className="w-full md:w-auto px-8 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Get Started
        </Button>
      </div>
    </Card>
  )
}
