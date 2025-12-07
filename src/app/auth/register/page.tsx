"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {BankAccount, RegistrationType} from "@/lib/auth";
import {WelcomeStep} from "@/components/registration/steps/welcome";
import {AuthenticationStep} from "@/components/registration/steps/authentication";
import {AccountsStep} from "@/components/registration/steps/accounts";
import {CompletionStep} from "@/components/registration/steps/completion";
import {ProgressIndicator} from "@/components/registration/progress";

export default function Page() {
  const [currentStep, setCurrentStep] = useState(0)
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null)
  const [accounts, setAccounts] = useState<BankAccount[]>([])

  const steps = [
    { id: "welcome", component: WelcomeStep },
    { id: "authentication", component: AuthenticationStep },
    { id: "accounts", component: AccountsStep },
    { id: "completion", component: CompletionStep },
  ]

  const CurrentStepComponent = steps[currentStep].component

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ProgressIndicator currentStep={currentStep} totalSteps={steps.length} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CurrentStepComponent
              onNext={handleNext}
              onBack={handleBack}
              registrationType={registrationType}
              setRegistrationType={setRegistrationType}
              accounts={accounts}
              setAccounts={setAccounts}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
