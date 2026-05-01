
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {

  const { pathname } = request.nextUrl;

  // Only protect /chat routes — let everything else through
  if (pathname.startsWith("/chat")) {
    const sessionId = request.cookies.get("session_id")?.value;
    if (!sessionId) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }



  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*"],
};
