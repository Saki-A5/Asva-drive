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

  console.log("Email passed to details: ", email);

  return (
    <>
      <div className="min-h-screen bg-white dark:bg-[#0a0c12] transition-colors duration-300">
        <header
          className="fixed top-0 w-full z-50 flex items-center h-20 px-6 md:px-10 
    /* Light/Dark background & border */
    bg-white/70 dark:bg-[#030712]/70 backdrop-blur-md border-b 
    border-slate-200 dark:border-white/5 transition-colors duration-300"
        >
          <Link href="/" className="group">
            <h2 className="text-xl font-bold tracking-tighter dark:text-white text-slate-900 transition-opacity group-hover:opacity-80">
              ASVA
            </h2>
          </Link>

          <div className="ml-auto flex items-center gap-4">
            {/* Small "Already have an account?" text (optional, but looks professional) */}
            <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
               Already have an account?
            </span>

            <Link href="/login">
              <Button
                className="h-9 px-6 rounded-full font-medium transition-all
          /* Dark Mode: White pill button */
          dark:bg-white dark:text-black dark:hover:bg-slate-200
          /* Light Mode: Dark pill button */
          bg-slate-900 text-white hover:bg-black shadow-sm"
              >
                Login
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex flex-col items-center justify-center pt-12">
          <div className="w-full">
            {step === "email" && (
              <Emailstep
                email={email}
                setEmail={setEmail}
                nextStep={nextStep}
              />
            )}

            {step === "otp" && <OtpStep email={email} nextStep={nextStep} />}

            {step === "details" && <Details email={email} />}
          </div>
        </main>
      </div>
    </>
  );
};

export default Signup;
