import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/shared/lib/auth/session";

// This project's Next.js build renamed middleware.ts -> proxy.ts (middleware.ts is deprecated
// here) — see node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.
// Route protection for /dashboard/* and /admin/* lives here since it must run before the route
// renders, on every request, without relying on client-side checks.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "super_admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (pathname.startsWith("/dashboard/chapter")) {
    const allowed = session.role === "super_admin" || session.role === "chapter_admin" || session.role === "chapter_member";
    if (!allowed || (session.role !== "super_admin" && !session.chapterId)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
