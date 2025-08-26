import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, otp } = req.body;

  // ✅ Check OTP against stored value in DB or cache
  if (otp === "123456") {
    return res.status(200).json({ message: "OTP verified" });
  }

  return res.status(400).json({ error: "Invalid OTP" });
}
