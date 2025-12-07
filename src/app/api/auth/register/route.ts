import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { users, webauthnCredentials } from "@/lib/db/schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import {getSessionCookie} from "@/lib/auth";

const passwordRegistrationSchema = z.object({
  type: z.literal("password"),
  email: z.string().email(),
  password: z.string().min(8),
});

const webauthnRegistrationSchema = z.object({
  type: z.literal("webauthn"),
  email: z.string().email().optional(),
  credentialId: z.string(),
  publicKey: z.string(),
  counter: z.string(),
  transports: z.array(z.string()).optional(),
  challengeId: z.string(),
});

const registrationSchema = z.discriminatedUnion("type", [
  passwordRegistrationSchema,
  webauthnRegistrationSchema,
]);

// Store challenges temporarily (in production, use Redis or similar)
const challenges = new Map<string, { challenge: Uint8Array; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = registrationSchema.parse(body);

    if (data.type === "password") {
      // Check if email already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, data.email),
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 400 }
        );
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          email: data.email,
          passwordHash,
          registrationType: "password",
        })
        .returning();

      const response = NextResponse.json({
        success: true,
        userId: user.id,
        registrationType: "password",
      });

      const { value, cookie } = await getSessionCookie(user.id);
      response.cookies.set('session', value, cookie)
      return response;
    } else if (data.type === "webauthn") {
      const challenge = challenges.get(data.challengeId);
      if (!challenge || challenge.expiresAt < Date.now()) {
        return NextResponse.json(
          { error: "Invalid or expired challenge" },
          { status: 400 }
        );
      }

      challenges.delete(data.challengeId);

      // WebAuthn registration
      const [user] = await db
        .insert(users)
        .values({
          email: data.email || null,
          registrationType: "webauthn",
        })
        .returning();

      await db.insert(webauthnCredentials).values({
        id: data.credentialId,
        userId: user.id,
        publicKey: data.publicKey,
        counter: data.counter,
        transports: data.transports || null,
      });

      const response = NextResponse.json({
        success: true,
        userId: user.id,
        registrationType: "webauthn",
      });

      const { value, cookie } = await getSessionCookie(user.id);
      response.cookies.set('session', value, cookie)
      return response;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.stack);
    }

    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const challenge = crypto.randomBytes(32);
    const challengeId = crypto.randomBytes(16).toString("hex");

    // Store challenge for 5 minutes
    challenges.set(challengeId, {
      challenge,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    // Clean up expired challenges
    for (const [id, data] of challenges.entries()) {
      if (data.expiresAt < Date.now()) {
        challenges.delete(id);
      }
    }

    return NextResponse.json({
      challenge: Buffer.from(challenge).toString("base64url"),
      challengeId,
    });
  } catch (error) {
    console.error("Challenge generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate challenge" },
      { status: 500 }
    );
  }
}
