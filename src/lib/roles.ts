export const runtime = 'nodejs';

import { adminAuth } from '@/lib/firebaseAdmin';
import User from '@/models/users';
import dbConnect from '@/lib/dbConnect';
import { cookies } from 'next/headers';
// import { NextRequest } from "next/server";

export const requireRole = async (req: Request, roles: string[]) => {
  try {
    // Read token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { error: 'Not authenticated', status: 401 };
    }

    // Verify Firebase token
    const decoded = await adminAuth.verifyIdToken(token);

    await dbConnect();

    // Find user in MongoDB
    const user = await User.findOne({ email: decoded.email });

    if (!user) return { error: 'User not found', status: 404 };

    // Check role
    if (!roles.includes(user.role)) {
      return { error: 'Forbidden — insufficient role', status: 403 };
    }

    return { user };
  } catch (err: any) {
    return { error: err.message, status: 500 };
  }
};
