"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Darker_Grotesque } from "next/font/google";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

import { Menu, X } from "lucide-react";

const darkerGrotesque = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // all Tailwind-supported weights
});

export default function Hero() {
  const { setTheme } = useTheme();
  const [openBar, setOpenBar] = useState(false);
  const pathName = usePathname();
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpenBar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLandingPage = pathName === "/";
  const isLandingPageDetail = pathName === "/landingPageDetail";

  console.log(isLandingPage);
  return (
    <section className="p-3 md:p-5 lg:p-7 mb-[95px] md:mb-[300px]">
      <div className="w-full h-[500px] lg:h-[712px] bg-[radial-gradient(ellipse_at_center,#02427E_0%,#050E3F_100%)] rounded-2xl relative">
        <motion.div
          className="hidden lg:block absolute w-[220px] h-[300px] top-10 right-[74px] rounded-full bg-[#0AFEF2] blur-[184px]"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />

        <motion.div
          className="hidden lg:block absolute w-[220px] h-[250px] bottom-10 left-[74px] rounded-full bg-[#0AFEF2] blur-[184px]"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
        <nav className="w-full flex justify-between p-4 relative">
          <Link href="/" className="cursor-pointer">
          <div id="logo" className="flex gap-2 items-center">
            <Image
              src="/abuadLogo.png"
              alt="Abuad Logo"
              width={30}
              height={30}
            />
            <Image
              src="/asva logo.png"
              alt="Asva Logo"
              width={30}
              height={30}
            />
            <h1 className="font-semibold text-xl text-white">ASVA HUB</h1>
          </div>
          </Link>
          <div
            id="content"
            className={` items-center
    md:flex-row md:static md:bg-transparent md:w-auto hidden md:flex gap-10
  `}
          >
            <Link href="/landingPageDetails#features" className={`font-normal text-[16px] text-white `}>
              Features
            </Link>
            <Link href="/landingPageDetails#contact" className={`font-normal text-[16px] text-white`}>
              Contact Us
            </Link>
            <Link href="/landingPageDetails#about" className={`font-normal text-[16px] text-white`}>
              About Us
            </Link>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [@media(min-width:768px)_and_(max-width:1024px)]:flex hidden"
              >
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AnimatePresence>
            {openBar && (
              <motion.div
                id="content"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`
        flex items-center
        md:flex-row md:static md:bg-transparent md:w-auto
        flex-col absolute right-4 top-12 bg-white rounded-2xl w-[200px] py-3 md:flex z-20 gap-5
      `}
              >
                <Link
                  href="/landingPageDetails#features"
                  className="font-normal text-[16px] text-[#050E3F]"
                >
                  Features
                </Link>
                <Link
                  href="/landingPageDetails#contact"
                  className="font-normal text-[16px] text-[#050E3F]"
                >
                  Contact Us
                </Link>
                <Link
                  href="/landingPageDetails#about"
                  className="font-normal text-[16px] text-[#050E3F]"
                >
                  About Us
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <div id="buttons" className="gap-4 items-center hidden lg:flex">
            <Link
              href="/login"
              className="py-2 px-5 bg-[#D9D9D9]/30 text-white text-[16px] rounded-lg font-semibold border backdrop-blur-[5px]"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="py-2 px-5 bg-[#0AFEF2] text-[#050E3F] text-[16px] rounded-lg font-semibold"
            >
              Sign up
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="md:hidden flex gap-5">
            <button
              aria-label="Toggle navigation menu"
              className="text-white"
              onClick={() => setOpenBar(!openBar)}
            >
              {openBar ? <X /> : <Menu />}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>
        <section className="mt-10 flex flex-col justify-center items-center">
          <h1
            className={` ${darkerGrotesque.className}
  font-semibold
  text-3xl md:text-6xl lg:text-[96px]
  leading-none lg:leading-[81px]
  text-center text-white mb-3 sm:mb-5
`}
          >
            {isLandingPage ? (
              <>
                Your On-campus Cloud <br /> Storage Solution
              </>
            ) : (
              <>
                The Future of On-Campus <br /> Academic Storage
              </>
            )}
          </h1>
          <p
            className="
  text-xs sm:text-base md:text-base lg:text-[20px]
  text-center text-white mb-8 px-2
"
          >
            {isLandingPage
              ? "Every resource needed in one place. Accessible anytime and anywhere."
              : "ASVA HUB isn't just a folder in the cloud. It's a specialized workspace built to handle the unique demands of university life."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="/login"
                className="py-2 px-5 bg-[#D9D9D9]/30 text-white text-[16px] rounded-lg font-semibold border backdrop-blur-[5px] inline-block"
              >
                Login
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Link
                href="/signup"
                className="py-2 px-5 bg-[#0AFEF2] text-[#050E3F] text-[16px] rounded-lg font-semibold"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </section>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="
    relative
    w-[87%] sm:w-[80%] lg:w-[840px]
    aspect-[14/9]
    rounded-[15px]
    border border-white
    shadow-[0_10px_40px_14px_rgba(0,0,0,0.2)]
    mt-7
    mx-auto
    mb-20
    sm:mb-52
  "
        >
          <Image
            src="/preview.webp"
            alt="Preview"
            fill
            className="rounded-[15px] object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
