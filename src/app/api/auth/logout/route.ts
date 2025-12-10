import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
  const response = new NextResponse(null, { status: 204 });
  response.cookies.set("session", "", {
    expires: new Date().getTime()
  })
  return response;
}