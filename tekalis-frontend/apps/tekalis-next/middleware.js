import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout", "/checkout/:path*", "/wishlist", "/wishlist/:path*", "/login", "/register"],
};
