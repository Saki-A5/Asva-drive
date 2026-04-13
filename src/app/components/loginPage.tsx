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
    <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
      {/* Header & Branding */}
      <div className="flex flex-col items-center mb-8">
        {/* Note: Added a subtle white background to the logo in case it is a dark JPG that disappears in dark mode */}
        <div className="bg-white p-2 rounded-xl mb-4">
          <img
            src="/asva logo.jpg"
            alt="asva logo"
            className="h-14 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Please enter your details to sign in.
        </p>
      </div>

      {/* OAuth Actions */}
      <Button
        onClick={handleGoogleLogIn}
        type="button"
        className="cursor-pointer w-full flex items-center justify-center gap-3 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all font-medium">
        <img
          src="/google.png"
          alt="google"
          className="w-5 h-5"
        />
        Sign in with Google
      </Button>

      {/* Responsive Divider */}
      <div className="flex items-center w-full my-6">
        <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
        <span className="px-4 text-sm text-gray-400 dark:text-gray-500">
          or continue with email
        </span>
        <div className="flex-1 border-t border-gray-200 dark:border-gray-800"></div>
      </div>

      {/* Form Setup */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email address"
                    {...field}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </FormControl>
                <FormMessage className="text-xs ml-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...field}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 focus:bg-white dark:focus:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                  />
                </FormControl>
                <FormMessage className="text-xs ml-1" />
              </FormItem>
            )}
          />

          {/* Meta Links */}
          <div className="flex justify-end w-full pt-1 pb-4">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Primary Action */}
          <Button
            type="submit"
            className="cursor-pointer w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
            Sign In
          </Button>

          {/* Signup Route */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-black dark:text-white hover:underline transition-all">
              Sign up
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};
export default Loginpage;
