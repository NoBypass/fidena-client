import {NextRequest, NextResponse} from "next/server";
import { URLPattern } from "urlpattern-polyfill";
import {verifyJWT} from "@/lib/auth";

type Matcher = {
  pattern: URLPattern | URLPattern[],
  handler: (req: NextRequest) => Promise<NextResponse>
}

const simpleMatcher: Matcher[] = [
  {
    pattern: [
      new URLPattern({ pathname: '/api/bank-accounts' }),
      new URLPattern({ pathname: '/api/bank-accounts/:path' }),
      new URLPattern({ pathname: '/api/user' }),
      new URLPattern({ pathname: '/api/user/complete-registration' }),
    ],
    handler: async (req: NextRequest) => {
      try {
        const headers = await processSession(req)
        return NextResponse.next({ request: { headers } })
      } catch (err) {
        return NextResponse.redirect('/auth/login')
      }
    }
  }
]

export default async function proxy(req: NextRequest) {
  for (const matcher of simpleMatcher) {
    if (Array.isArray(matcher.pattern)) {
      for (const pattern of matcher.pattern) {
        // if (!req.nextUrl.pathname.includes("_next"))
        //   console.log(pattern.pathname, req.nextUrl.pathname, pattern.test(req.nextUrl))
        if (pattern.test(req.nextUrl))
          return await matcher.handler(req)
      }
    } else {
      if (matcher.pattern.test(req.nextUrl))
        return await matcher.handler(req)
    }
  }

  return NextResponse.next()
}

async function processSession(req: NextRequest) {
  if (req.headers.has("x-user-id")) return new Headers(req.headers)

  const token = req.cookies.get("session")?.value;
  if (!token) throw new Error("No session cookie");

  const payload = await verifyJWT(token);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload?.sub || "");

  return requestHeaders
}
