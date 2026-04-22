"use client";
import Loginpage from "../components/loginPage";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Login = () => {
  return (
    // <>
    //     <div className=" flex h-20 pt-2">
    //     <Link href="/">
    //     <h2 className="font-bold ml-4">ASVA</h2>
    //     </Link>
    //     <Link className="ml-auto mr-4" href="/signup">
    //         <Button className="bg-blue-600 hover:bg-blue-800">Sign up</Button>
    //     </Link>
    //     </div>

    //     <Loginpage />
    // </>
    <>
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
            New here?
          </span>

          <Link href="/signup">
            <Button
              className="h-9 px-6 rounded-full font-medium transition-all
          /* Dark Mode: White pill button */
          dark:bg-white dark:text-black dark:hover:bg-slate-200
          /* Light Mode: Dark pill button */
          bg-slate-900 text-white hover:bg-black shadow-sm"
            >
              Sign up
            </Button>
          </Link>
        </div>
      </header>

      {/* Added pt-20 to prevent the fixed header from covering the login page */}
      <main className="pt-20  bg-slate-50 dark:bg-[#030712]">
        <Loginpage />
      </main>
    </>
  );
};

export default Login;
