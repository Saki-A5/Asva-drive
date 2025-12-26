import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "../../models/users";
import { adminAuth } from "@/lib/firebaseAdmin"; // Using your existing export

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  try {
    await dbConnect();

    const { token, name } = req.body;

    if (!token) return res.status(400).json({ message: "Token is required" });

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email } = decodedToken;

    // Check if user exists in MongoDB
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, firebaseUid: uid, role: "user" });
    }

    return res.status(201).json({ success: true, user });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}
