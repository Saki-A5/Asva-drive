import { NextResponse } from "next/server";

export const POST = async(req: Request) => {
  const res = NextResponse.json({ message: "Logout successful" });
  res.cookies.set("token", "", {
    maxAge: 0,
    path: '/',
  });
  return res;
}