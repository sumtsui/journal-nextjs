import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as jose from "jose";

const PROTECTED_ROUTES = ["/posts"];

export async function authMiddleware(request: NextRequest) {
  if (!PROTECTED_ROUTES.includes(request.nextUrl.pathname)) return;

  const token = request.cookies.get("session");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const decoded = await jose.jwtVerify(
    token.value,
    new TextEncoder().encode(process.env.JWT_SECRET!)
  );

  if (!decoded.payload.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (decoded.payload.exp! < Date.now() / 1000) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("X-User-ID", decoded.payload.userId as string);
  return response;
}
