import { NextResponse } from "next/server";

export const POST = async(req: Request) => {
  try{  
    const res = NextResponse.json({ message: "Logout successful" });
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: '/',
      expires: new Date(0),
    });
    return res;
  } catch (error: any) {
    console.error("Logout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}