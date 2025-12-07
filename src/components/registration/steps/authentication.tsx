"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Fingerprint, Mail, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react"
import {RegistrationType} from "@/lib/auth";
import * as z from "zod"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";


interface AuthenticationStepProps {
  onNext: () => void
  onBack: () => void
  registrationType: RegistrationType
  setRegistrationType: (type: RegistrationType) => void
}

const passkeyFormSchema = z.object({
  email: z.email("Please enter a valid email address").optional().or(z.literal("")),
})

const passwordFormSchema = z.object({
  email: z.email("Please enter a valid email address").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasskeyFormValues = z.infer<typeof passkeyFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

export function AuthenticationStep({ onNext, onBack, registrationType, setRegistrationType }: AuthenticationStepProps) {
  const [isCreatingPasskey, setIsCreatingPasskey] = useState(false)
  const [passkeyError, setPasskeyError] = useState<string | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<RegistrationType | null>(null)

  const passkeyForm = useForm<PasskeyFormValues>({
    resolver: zodResolver(passkeyFormSchema),
    defaultValues: {
      email: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handlePasskeySetup = async () => {
    setIsCreatingPasskey(true)
    setPasskeyError(null)

    try {
      if (!window?.PublicKeyCredential) {
        throw new Error("Passkeys are not supported on this device")
      }

      const response = await fetch("/api/auth/register")
      if (!response.ok) {
        throw new Error("Unable to create passkey. Please use email & password instead.")
      }

      const { challenge: challengeBase64, challengeId } = await response.json()
      const challenge = Uint8Array.from(
        atob(challengeBase64.replace(/-/g, '+').replace(/_/g, '/')),
        c => c.charCodeAt(0)
      )

      const userId = new Uint8Array(16)
      crypto.getRandomValues(userId)

      const email = passkeyForm.getValues().email

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Fidena",
            id: window.location.hostname,
          },
          user: {
            id: userId,
            name: email || `user_${Date.now()}@fidena.app`,
            displayName: email || "User",
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: true,
            userVerification: "required",
          },
          timeout: 60000,
          extensions: {
            prf: {},
          },
        },
      }) as PublicKeyCredential

      if (!credential) {
        throw new Error("Failed to create credential")
      }

      const prfEnabled = (credential as PublicKeyCredential)?.getClientExtensionResults?.()?.prf?.enabled

      if (!prfEnabled) {
        setPasskeyError(
          "Your authenticator doesn't support PRF, which is required for end-to-end encryption. Please use email & password instead.",
        )
        setIsCreatingPasskey(false)
        return
      }

      // Extract credential data
      const attestationResponse = credential.response as AuthenticatorAttestationResponse
      const credentialId = Array.from(new Uint8Array(credential.rawId))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Extract public key from attestation response
      const publicKeyArrayBuffer = attestationResponse.getPublicKey()
      if (!publicKeyArrayBuffer) {
        throw new Error("Failed to extract public key")
      }

      const publicKey = Array.from(new Uint8Array(publicKeyArrayBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      // Get transports if available
      const transports = attestationResponse.getTransports ?
        attestationResponse.getTransports() : []

      // Register credential with backend
      const registerResponse = await fetch("/api/auth/register", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "webauthn",
          email: email || undefined,
          credentialId,
          publicKey,
          counter: "0",
          transports,
          challengeId,
        }),
      })

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json()
        throw new Error(errorData.error || "Registration failed")
      }

      setRegistrationType("webauthn")
      onNext()
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        setPasskeyError("Passkey creation was cancelled. Please try again or use email & password.")
      } else if (error.message) {
        setPasskeyError(error.message)
      } else {
        setPasskeyError("Unable to create passkey. Please use email & password instead.")
      }
      setIsCreatingPasskey(false)
    }
  }

  const handlePasswordSetup = async () => {
    const { email, password, confirmPassword } = passwordForm.getValues()

    if (email && password && password === confirmPassword) {
      try {
        const response = await fetch("/api/auth/register", {
          credentials: "include",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "password",
            email,
            password,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Registration failed")
        }

        setRegistrationType("password")
        onNext()
      } catch (error: any) {
        console.error("Password registration error:", error)
        setPasskeyError(error.message || "Failed to register with password")
      }
    }
  }

  return (
    <Card className="p-8 md:p-12">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Choose Authentication</h2>
          <p className="text-muted-foreground text-pretty leading-relaxed">
            Select how {"you'd"} like to secure your account
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setSelectedMethod("webauthn")}
            disabled={isCreatingPasskey || registrationType === "password"}
            className={`w-full p-6 rounded-xl border text-left transition-all ${
              selectedMethod === "webauthn"
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50 hover:bg-accent/5"
            } ${isCreatingPasskey || registrationType === "password" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Fingerprint className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">Passkey Authentication</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
                    Recommended
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  Use your {"device's"} biometrics for the most secure and convenient sign-in experience
                </p>

                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Supports end-to-end encryption with compatible authenticators</span>
                </div>
              </div>
            </div>
          </button>

          {passkeyError && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-destructive font-medium mb-1">Passkey Setup Failed</p>
                  <p className="text-sm text-muted-foreground">{passkeyError}</p>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === "webauthn" && !registrationType && (
            <div className="p-6 rounded-xl border border-accent bg-accent/5 space-y-4">
              <Form {...passkeyForm}>
                <form onSubmit={passkeyForm.handleSubmit(handlePasskeySetup)} className="space-y-4">
                  <FormField
                    control={passkeyForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Used for account recovery
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isCreatingPasskey}
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    {isCreatingPasskey ? (
                      <>
                        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Passkey...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4 mr-2" />
                        Set Up Passkey
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-medium">Or</span>
            </div>
          </div>

          {/* Email/Password Option */}
          <button
            onClick={() => setSelectedMethod("password")}
            disabled={isCreatingPasskey || registrationType === "webauthn"}
            className={`w-full p-6 rounded-xl border text-left transition-all ${
              selectedMethod === "password"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            } ${isCreatingPasskey || registrationType === "webauthn" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-secondary">
                <Mail className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email & Password</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Traditional authentication method available on all devices
                </p>
              </div>
            </div>
          </button>

          {selectedMethod === "password" && !registrationType && (
            <div className="p-6 rounded-xl border border-primary bg-primary/5 space-y-4">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSetup)} className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Create a strong password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Re-enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Continue with Password
                  </Button>
                </form>
              </Form>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={onBack} variant="outline" className="flex-1 bg-transparent">
            Back
          </Button>
        </div>
      </div>
    </Card>
  )
}
