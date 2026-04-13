"use client";
import Emailstep from "../components/Email";
import OtpStep from "../components/OtpStep";
import { useState } from "react";
import Link from "next/link";
import Details from "../components/SignupDetail";
import { Button } from "@/components/ui/button";

const Signup = () => {
  const [step, setStep] = useState<"email" | "otp" | "details">("email");
  const [email, setEmail] = useState("");

  const nextStep = () => {
    if (step === "email") setStep("otp");
    else if (step === "otp") setStep("details");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans transition-colors duration-300">
      {/* Navigation Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 w-full shadow-sm">
        <Link
          href="/"
          className="transition-transform hover:scale-105">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
            ASVA
          </h2>
        </Link>
        <Link href="/login">
          <Button className="bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-full px-6 py-2 transition-all duration-300">
            Log in
          </Button>
        </Link>
      </header>

      {/* Centered Step Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 transition-colors duration-300">
          {step === "email" && (
            <Emailstep
              email={email}
              setEmail={setEmail}
              nextStep={nextStep}
            />
          )}
          {step === "otp" && (
            <OtpStep
              email={email}
              nextStep={nextStep}
            />
          )}
          {step === "details" && <Details email={email} />}
        </div>
      </main>
    </div>
  );
};

export default Signup;
