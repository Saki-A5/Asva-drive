import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebaseAdmin";
import Dashboard from "../components/Dashboard";

const DashboardPage = async() => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  // Not logged in
  if (!token) {
    redirect("/login");
  }

  try {
    // Verify Firebase session cookie
    await adminAuth.verifySessionCookie(token, true);

    // Token valid → render client dashboard
    return <Dashboard />;
  } catch {
    // Token expired / invalid
    redirect("/login");
  }
}

export default DashboardPage;