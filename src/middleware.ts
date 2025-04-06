import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;
    const { pathname } = request.nextUrl;

    if (
      !accessToken &&
      ["/dashboard", "/update", "/create"].some((route) =>
        pathname.startsWith(route)
      )
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (accessToken && (pathname === "/" || pathname === "/login")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard", "/login", "/create", "/update/:path*"],
};

// try {
//   const token = request.cookies.get('access_token')?.value || 'null';
//   const response = await checkAccessToken(token);

//   if (
//     !response.dataToken &&
//     (request.nextUrl.pathname.startsWith('/admin') ||
//       request.nextUrl.pathname.startsWith('/mentor') ||
//       request.nextUrl.pathname.startsWith('/mentee'))
//   ) {
//     return NextResponse.redirect(new URL('/signin', request.nextUrl));
//   }

// if (response.dataToken) {

//   const userRole = response.dataToken.role;
