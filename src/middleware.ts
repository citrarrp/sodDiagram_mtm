import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import decodeJWT from "./lib/function";

const corsOptions: {
  allowedMethods: string[];
  allowedOrigins: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge?: number;
  credentials: boolean;
} = {
  allowedMethods: (process.env?.ALLOWED_METHODS || "").split(","),
  allowedOrigins: (
    process.env?.ALLOWED_ORIGIN || "http://localhost:5173"
  ).split(","),
  allowedHeaders: (process.env?.ALLOWED_HEADERS || "").split(","),
  exposedHeaders: (process.env?.EXPOSED_HEADERS || "").split(","),
  maxAge: (process.env?.MAX_AGE && parseInt(process.env?.MAX_AGE)) || undefined, // 60 * 60 * 24 * 30, // 30 days
  credentials: process.env?.CREDENTIALS == "true",
};

export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();

    const origin = request.headers.get("origin") ?? "";
    if (
      corsOptions.allowedOrigins.includes("*") ||
      corsOptions.allowedOrigins.includes(origin)
    ) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set(
      "Access-Control-Allow-Credentials",
      corsOptions.credentials.toString()
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      corsOptions.allowedMethods.join(",")
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      corsOptions.allowedHeaders.join(",")
    );
    response.headers.set(
      "Access-Control-Expose-Headers",
      corsOptions.exposedHeaders.join(",")
    );
    response.headers.set(
      "Access-Control-Max-Age",
      corsOptions.maxAge?.toString() ?? ""
    );

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
    return response;
  } catch (error) {
    console.error(`${error}`);
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/login",
    "/create",
    "/update/:path*",
    "/register",
    "/api/:path*",
  ],
};
