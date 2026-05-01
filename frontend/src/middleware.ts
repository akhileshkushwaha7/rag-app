import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionId = request.cookies.get("session_id")?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith("/auth");
  const isChatPage = pathname.startsWith("/chat");

  if (isChatPage && !sessionId) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthPage && sessionId) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/auth/:path*"],
};
