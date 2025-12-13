// /api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Otp from '@/models/Otp';

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  await dbConnect();

  const record = await Otp.findOne({ email });
  if (!record)
    return NextResponse.json({ error: 'OTP not found' }, { status: 400 });

  if (record.otp !== otp) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
  }

  return NextResponse.json({ message: 'OTP verified' });
}
