import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAuthPage =
    request.nextUrl.pathname === "/signin" ||
    request.nextUrl.pathname === "/api/auth/callback/github" ||
    request.nextUrl.pathname === "/api/auth/callback/google";

  if (!session) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthPage && request.nextUrl.pathname === "/signin") {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/signin"],
};
