"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BankAccount, RegistrationType} from "@/lib/auth";
import { WelcomeStep } from "@/components/registration/steps/welcome";
import { AuthenticationStep } from "@/components/registration/steps/authentication";
import { AccountsStep } from "@/components/registration/steps/accounts";
import { CompletionStep } from "@/components/registration/steps/completion";
import { ProgressIndicator } from "@/components/registration/progress";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [registrationType, setRegistrationType] = useState<RegistrationType>(null)
  const [registeredAccounts, setRegisteredAccounts] = useState<BankAccount[]>([])

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

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(user => {
        if (user.error) throw user.error
        if (user.completedRegistration) {
          router.push('/dashboard')
        } else {
          setCurrentStep(2)
        }
      })
      .catch(console.error)
  }, []);

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
              registeredAccounts={registeredAccounts}
              setRegisteredAccounts={setRegisteredAccounts}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
