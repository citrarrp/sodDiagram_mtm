import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import decodeJWT from "./lib/function";

export function middleware(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const { pathname } = request.nextUrl;
    if ( !accessToken && ["/dashboard", "/update", "/create"].some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (accessToken && (pathname === "/" || pathname === "/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/register") {
      if (!accessToken) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      const user = decodeJWT(accessToken);
      const username = user?.username || "";
      if (!username.includes("admin")) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }
  } catch (error) {
    console.error(`${error}`);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/login",
    "/create",
    "/update/:path*",
    "/register",
  ],
};
