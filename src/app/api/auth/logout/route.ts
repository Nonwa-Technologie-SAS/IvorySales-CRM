import { NextResponse } from "next/server";

/** POST /api/auth/logout - Supprime le cookie de session */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("auth_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  res.cookies.set("auth_role", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
