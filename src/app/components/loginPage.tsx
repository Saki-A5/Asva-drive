"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth, provider } from "@/lib/firebaseClient";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import { useEffect } from "react";
import Image from "next/image";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type loginForm = z.infer<typeof loginSchema>;

const Loginpage = () => {
  const form = useForm<loginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const handleGoogleLogIn = async () => {
    try {
      await signInWithRedirect(auth, provider);
    } catch (error: any) {
      console.error(
        "Google login Error: ",
        error.response?.data || error.message || error,
      );
      alert("Google login failed.");
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (!result) return;

        const user = result.user;
        const idToken = await user.getIdToken();
        await axios.post("/api/loginauth", { idToken });
        window.location.href = "/dashboard";
        // router.push("/dashboard")
      } catch (error: any) {
        console.error("Redirect login error:", error);
        alert("Google login failed");
      }
    };

    handleRedirectResult();
  }, [router]);
  const onSubmit = async (values: loginForm) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password,
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // 3. Send token + name to backend
      await axios.post("/api/loginauth", {
        idToken,
      });
      router.push("/dashboard");
    } catch (error: any) {
      let message = "Login failed. Please try again.";
      if (error.code === "auth/user-not-found") {
        message = "No user found with this email. Please sign up first.";
      } else if (error.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-credential") {
        message = "Invalid credentials. Please check your email and password.";
      }

      console.error("Email login error: ", error);
      alert(error.code || message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-4">
      {/* Main Card Container */}
      <div
        className="w-full max-w-[520px] p-8 md:p-10 rounded-[32px] 
  /* Dark Mode: deep navy, faint border */
  dark:bg-[#0B101B]/60 dark:border-white/5 
  /* Light Mode: white, soft gray border */
  bg-white border-slate-200 
  backdrop-blur-xl shadow-2xl transition-colors duration-300"
      >
        {/* Branding Area */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 
      dark:bg-black dark:border-white/10 bg-slate-50 border-slate-200 border shadow-sm"
          >
            <Image
              src="/asva logo.jpg"
              alt="logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight dark:text-white text-slate-900">
            Welcome back
          </h2>
          <p className="text-sm dark:text-slate-400 text-slate-500 mt-2">
            Please enter your details to sign in.
          </p>
        </div>

        {/* Google Action */}
        <Button
          onClick={handleGoogleLogIn}
          variant="outline"
          className="w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-all mb-8
      dark:bg-[#1E293B]/30 dark:border-white/5 dark:text-white dark:hover:bg-[#1E293B]/50
      bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Image src="/google.png" alt="google" width={18} height={18} />
          <span className="text-sm font-medium">Sign in with Google</span>
        </Button>

        {/* Simplified Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-[1px] flex-1 dark:bg-white/5 bg-slate-200"></div>
          <span className="text-[10px] dark:text-slate-500 text-slate-400 font-bold uppercase tracking-[0.2em]">
            or continue with email
          </span>
          <div className="h-[1px] flex-1 dark:bg-white/5 bg-slate-200"></div>
        </div>

        {/* Login Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Email address"
                      {...field}
                      className="h-12 rounded-xl transition-all
                  dark:bg-[#030712] dark:border-white/5 dark:text-white dark:focus:ring-white/10
                  bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-200 placeholder:text-slate-400"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px] ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      placeholder="Password"
                      {...field}
                      className="h-12 rounded-xl transition-all
                  dark:bg-[#030712] dark:border-white/5 dark:text-white dark:focus:ring-white/10
                  bg-slate-50 border-slate-200 text-slate-900 focus:ring-slate-200 placeholder:text-slate-400"
                    />
                  </FormControl>
                  <div className="flex justify-end pt-1">
                    <Link
                      href="/forgot-password"
                      px-1
                      className="text-[12px] dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <FormMessage className="text-[11px] ml-1" />
                </FormItem>
              )}
            />

            <Button
              className="w-full h-12 rounded-xl font-bold transition-all mt-4
        dark:bg-white dark:text-black dark:hover:bg-slate-200
        bg-slate-900 text-white hover:bg-black shadow-lg"
            >
              Sign In
            </Button>

            <p className="text-center mt-6 text-sm dark:text-slate-400 text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="dark:text-white text-slate-900 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Loginpage;
