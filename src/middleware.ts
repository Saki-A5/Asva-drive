import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  //  Landing page logic
  if (pathname === "/") {
    if (!token) return NextResponse.next();

    try {
      await adminAuth.verifyIdToken(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      const res = NextResponse.next();
      res.cookies.delete("token");
      return res;
    }
  }

  // 🔒 Protected routes
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await adminAuth.verifyIdToken(token);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/recent/:path*",
    "/starred/:path*",
    "/files/:path*",
    "/trash/:path*",
    "/shared/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};

