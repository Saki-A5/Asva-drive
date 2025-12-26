// app/api/test-login/route.ts
import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Handle GET requests
export async function GET(req: NextRequest) {
  try {
    const testUid = "test-user-123";

    const customToken = await admin.auth().createCustomToken(testUid);

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create custom token" }, { status: 500 });
  }
}
