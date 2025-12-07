import {NextRequest, NextResponse} from "next/server";
import {verifyJWT} from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const payload = await verifyJWT(token);

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload?.sub || "");

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (err) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ['/api/bank-accounts', '/api/bank-accounts/:path'],
}