import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import { NextResponse } from "next/server";

const POST = async (req: Request) => {
  const { userId, token } = await req.json();

  await dbConnect();

  await User.findByIdAndUpdate(userId, {
    $addToSet: { fcmTokens: token }
  });

  return NextResponse.json({ success: true });
}

export default POST;
