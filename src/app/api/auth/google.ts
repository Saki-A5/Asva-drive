import type { NextApiRequest, NextApiResponse } from "next";
import { adminAuth } from "@/lib/firebaseAdmin";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { idToken } = req.body;

    // Verify Google token using Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Extract user info
    const { uid, email, name, picture } = decodedToken;

    // ✅ Send OTP or create user in your DB (MongoDB or Firebase)
    // Example: Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save OTP to DB (or in-memory for dev mode)
    // ...

    return res.status(200).json({ message: "OTP sent", otp, uid, email, name, picture });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}
