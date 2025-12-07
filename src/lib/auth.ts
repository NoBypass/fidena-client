import {SignJWT, jwtVerify, JWTPayload} from "jose";
import { version } from "@/../package.json"
import {ResponseCookie} from "next/dist/compiled/@edge-runtime/cookies";

export type RegistrationType = "webauthn" | "password" | null

export interface BankAccount {
  id: string
  name: string
  accountNumber: string
  balance: string
  currency: string
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function generateJWT(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionCookie(userId: string) {
  const now = Math.floor(new Date().getTime() / 1000);
  const maxAge = 60 * 60 * 24 * 30;

  return {
    value: await generateJWT({
      iat: now,
      iss: `fidena-next-backend_${version}`,
      sub: userId,
      exp: now + maxAge
    }),
    cookie: {
      httpOnly: true,
      maxAge: maxAge,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    } as Partial<ResponseCookie>
  }
}
