"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import z from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        setError("Invalid reset link. Please request a new password reset.");
        setIsValidating(false);
        return;
      }

      try {
        const response = await axios.get(`/api/auth/reset-password?token=${token}`);
        if (response.data.valid) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
          setError("Invalid or expired reset link. Please request a new password reset.");
        }
      } catch (err: any) {
        setIsValidToken(false);
        setError(
          err.response?.data?.error ||
            "Invalid or expired reset link. Please request a new password reset."
        );
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (values: ResetPasswordForm) => {
    if (!token) {
      setError("Invalid reset link.");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post("/api/auth/reset-password", {
        token,
        newPassword: values.password,
      });

      setMessage(response.data.message || "Password has been reset successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || "An error occurred. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <img
              src="/asva logo.jpg"
              alt="asva logo"
              height={60}
              width={70}
              className="mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Reset Link
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/forgot-password">
              <Button className="w-full">Request New Reset Link</Button>
            </Link>
            <div className="mt-4">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img
            src="/asva logo.jpg"
            alt="asva logo"
            height={60}
            width={70}
            className="mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">
            Enter your new password below.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="New Password"
                        type="password"
                        {...field}
                        className="h-12"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Confirm New Password"
                        type="password"
                        {...field}
                        className="h-12"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
                  {message}
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

