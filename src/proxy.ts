import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const proxy = auth((request) => {
  if (!request.auth) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
