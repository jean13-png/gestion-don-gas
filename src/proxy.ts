import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isLoginPage = request.nextUrl.pathname === "/connexion";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!token && isAdminRoute && !isLoginPage) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/connexion"],
};
