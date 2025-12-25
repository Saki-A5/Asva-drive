"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Darker_Grotesque } from "next/font/google";

import {
  Menu,
  X,
  Folder,
  Share2,
  Sparkles,
  LucideIcon,
  Plus,
  Minus,
} from "lucide-react";
import Navbar from "./components/Navbar";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<string, LucideIcon> = {
  folder: Folder,
  share: Share2,
  ai: Sparkles,
};

const features = [
  {
    title: "Student Content Organization",
    description:
      "Manage content efficiently. Easily categorize, search, and retrieve files, ensuring you always have what you need at your fingertips.",
    icon: "folder",
  },
  {
    title: "Seamless File Sharing",
    description:
      "Share files seamlessly with Asva. Collaborate with students effortlessly, ensuring everyone has access to the latest versions of your documents.",
    icon: "share",
  },
  {
    title: "AI Assistance",
    description:
      "AI assist to summarize content and ensure you are up to date.",
    icon: "ai",
  },
] as const;

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What features are they?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus donec rhoncus eros lobortis nulla molestie mattis scelerisque maximus eget fermentum odio phasellus non purus est efficitur laoreet mauris pharetra vestibulum fusce dictum risus.",
  },
  {
    id: 2,
    question: "How does the in-built AI work?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus donec rhoncus eros lobortis nulla molestie mattis scelerisque maximus eget fermentum odio phasellus non purus est efficitur laoreet mauris pharetra vestibulum fusce dictum risus.",
  },
  {
    id: 3,
    question: "Who can use ASVA Drive?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus donec rhoncus eros lobortis nulla molestie mattis scelerisque maximus eget fermentum odio phasellus non purus est efficitur laoreet mauris pharetra vestibulum fusce dictum risus.",
  },
  {
    id: 4,
    question: "How do I know who has access to my files?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus donec rhoncus eros lobortis nulla molestie mattis scelerisque maximus eget fermentum odio phasellus non purus est efficitur laoreet mauris pharetra vestibulum fusce dictum risus.",
  },
  {
    id: 5,
    question: "What happens if there's an issue with my upload?",
    answer:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit quisque faucibus ex sapien vitae pellentesque sem placerat in id cursus mi pretium tellus duis convallis tempus leo eu aenean sed diam urna tempor pulvinar vivamus fringilla lacus nec metus bibendum egestas iaculis massa nisl malesuada lacinia integer nunc posuere ut hendrerit semper vel class aptent taciti sociosqu ad litora torquent per conubia nostra inceptos himenaeos orci varius natoque penatibus et magnis dis parturient montes nascetur ridiculus mus donec rhoncus eros lobortis nulla molestie mattis scelerisque maximus eget fermentum odio phasellus non purus est efficitur laoreet mauris pharetra vestibulum fusce dictum risus.",
  },
];

const darkerGrotesque = Darker_Grotesque({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], // all Tailwind-supported weights
});

const Home = () => {
  const [openBar, setOpenBar] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpenBar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    // <div className="overflow-x:hidden">
    //   <Navbar />
    //   <div className="md:grid md:grid-cols-2">
    //     <motion.div
    //     initial={{ opacity: 0, x: 100 }}
    //     whileInView={{ opacity: 1, x: 0 }}
    //     transition={{ duration: 1.0, ease: "easeOut" }}
    //     viewport={{ once: false }}
    //     className="w-4/5 mx-auto mb-8 md:order-2 lg:mr-100">
    //       <h2 className="font-bold text-2xl mb-2">Asva Drive - Your Smart Hub for Learning, Organizing, and Sharing</h2>
    //       <p className="mb-4">Manage your files and content effortlessly. Organize with precision, share without limits, and stay instantly informed on every update - easy to use platform</p>
    //       <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-800 w-full">Get Started</Button></Link>
    //     </motion.div>

    //     <motion.div
    //     initial={{ opacity: 0, x: -100 }}
    //     whileInView={{ opacity: 1, x: 0 }}
    //     transition={{ duration: 1.0, ease: "easeOut" }}
    //     viewport={{ once: false }}
    //     className="max-w-full pb-4 flex justify-center items-center">
    //     <div className="relative w-[250px] lg:w-[350px] h-[200px] right-10">
    //       <Image src='/myfiles.jpg' alt="first image" fill className="object-fill"/>
    //       <div className="absolute top-25 left-26 w-[250px] lg:w-[350px] h-[150px] shadow-lg overflow-hidden ">
    //         <Image src="/myfiles2.jpg" alt="overlay" fill className="object-fill"/>
    //       </div>
    //     </div>
    //     </motion.div>
    //   </div>

    //   {/* learning made easy */}
    //   <motion.div
    //    initial={{ opacity: 0, y: 50 }}
    //     whileInView={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 1.5, ease: "easeOut" }}
    //     viewport={{ once: false }}
    //    className="mb-45 mt-34">
    //     <div className="flex flex-col items-center w-70 mx-auto mb-4">
    //       <div className="flex items-center">
    //       <Image src="/reading.png" alt="learning made easy" width={26} height={26}/>
    //       <h3 className="pl-2 font-bold text-center leading-tight">learning made easy</h3>
    //       </div>
    //       <Image src="/liness.png" alt="lines" width={340} height={26} className="-mt-4"/>
    //     </div>
    //     <div className="mx-auto w-3/5">
    //     <p className="text-center text mb-8">Asva Drive makes learning easy with its intuitive interface and powerful features. Access your learning materials anytime, anywhere, and stay organized with smart content management.</p>
    //     </div>
    //     <div className="max-w-full pb-4 flex justify-center items-center">
    //     <div className="relative w-[270px] h-[200px] md:w-[330px] md:h-[280px] lg:w-[400px] left-10 md:left-20 lg:left-15 float-right">
    //       <Image src='/child.png' alt="first image" fill className="object-fill "/>
    //       <div className="absolute top-25 right-40 w-[200px] md:w-[270px] h-[150px] md:right-55 lg:right-65 md:top-38 md:h-[210px] shadow-lg overflow-hidden">
    //         <Image src="/books.png" alt="overlay" fill className="object-fill"/>
    //       </div>
    //     </div>
    //     </div>
    //   </motion.div>

    //   {/* smart organization for content management */}
    //   <motion.div
    //    initial={{ opacity: 0, filter: "blur(10px)" }}
    //     whileInView={{ opacity: 1, filter: "blur(0px)" }}
    //     transition={{ duration: 1.0, ease: "easeOut" }}
    //     viewport={{ once: false }}
    //    className="mb-24">
    //     <div className="flex justify-center items-center border rounded-lg w-80 sm:w-100 mx-auto mb-4">
    //       <Image src="/reading.png" alt="content management" width={26} height={26}/>
    //       <h3 className="pl-2 font-semibold text-center sm:text-left">Smart Organization for content Management</h3>
    //     </div>
    //     <div className="md:grid md:grid-cols-2">
    //       <div className="mx-auto w-4/5 text-center md:mr-0 md:my-auto">
    //         <p>Asva drive's smart organization features help you manage your content efficiently.</p>
    //         <p>Easily categorize, search, and retrieve files, enusring you always have what you need at your fingertips.</p>
    //       </div>
    //       <div className="flex justify-center items-center mt-6 w-[370px] h-[300px] lg:w-[440px] xl:w-[500px] xl:ml-12 lg:right-10 relative mx-auto">
    //         <Image src="/content management.png" alt="content management" fill />
    //       </div>
    //     </div>
    //   </motion.div>

    //   {/* Seamless file sharing */}
    //   <motion.div
    //    initial={{ opacity: 0, scale: 0.8 }}
    //     whileInView={{ opacity: 1, scale: 1 }}
    //     transition={{ duration: 1.5, ease: "easeOut" }}
    //     viewport={{ once: false }}
    //    className="mb-24 md:mb-52 lg:mb-68">
    //     <div className="flex flex-col items-center w-70 mx-auto mb-4">
    //       <div className="flex items-center">
    //       <Image src="/reading.png" alt="learning made easy" width={26} height={26}/>
    //       <h3 className="pl-2 font-bold text-center leading-tight">Seamless file sharing</h3>
    //       </div>
    //       <Image src="/liness.png" alt="lines" width={340} height={26} className="-mt-4"/>
    //     </div>
    //     <div className="md:grid md:grid-cols-2">
    //       <div className="mx-auto w-4/5 text-center md:mr-0 md:my-auto">
    //         <p>Share files seamlessly with Asva drive. Collaborate with team members and partners effortlessly, ensuring everyone has access to the latest verrsions of your documents.</p>
    //       </div>
    //       <div className="flex justify-center items-center mt-6 md:mt-0 md:top-10 w-[370px] h-[300px] lg:w-[440px] xl:w-[500px] xl:ml-12 lg:right-10 relative mx-auto">
    //         <Image src="/wifi.png" alt="file sharing" fill />
    //         <div className="absolute md:w-[380px] lg:w-[420px] xl:w-[445px] md:right-55 lg:right-85 md:top-55 md:h-[210px] lg:h-[260px] shadow-lg overflow-hidden z-[-1] hidden md:block">
    //         <Image src="/online-collaboration.png" alt="overlay" fill className="object-fill"/>
    //       </div>
    //       </div>
    //     </div>
    //   </motion.div>

    //   {/* Ai assistance */}
    //   <motion.div
    //    initial={{ opacity: 0, y: 50 }}
    //     whileInView={{ opacity: 1, y: 0 }}
    //     transition={{ duration: 1.5, ease: "easeOut" }}
    //     viewport={{ once: false }}
    //    className="mb-24">
    //     <div className="flex justify-center items-center border rounded-lg w-80 sm:w-100 mx-auto mb-4">
    //       <Image src="/reading.png" alt="content management" width={26} height={26}/>
    //       <h3 className="pl-2 font-semibold text-center sm:text-left">AI assistance and search</h3>
    //     </div>
    //     <div className="md:grid md:grid-cols-2">
    //       <motion.div
    //        initial={{ opacity: 0, x: 100 }}
    //        whileInView={{ opacity: 1, x: 0 }}
    //        transition={{ duration: 1.0, ease: "easeOut" }}
    //        viewport={{ once: false }}
    //        className="mx-auto w-4/5 text-center md:mr-0 md:mt-10 text-pink-600">
    //         <p>Share files seamlessly with Asva Drive. Collaborate with team members, clients, and partners effortlessly, ensuring everyone has access to the latest versions of your documents.</p>
    //       </motion.div>
    //       <motion.div
    //        initial={{ opacity: 0, x: -100 }}
    //        whileInView={{ opacity: 1, x: 0 }}
    //        transition={{ duration: 1.0, ease: "easeOut" }}
    //        viewport={{ once: false }}
    //        className="flex justify-center items-center mt-6 w-[370px] h-[300px] lg:w-[440px] xl:w-[500px] xl:ml-12 lg:right-10 relative mx-auto">
    //         <Image src="/robot.png" alt="content management" fill />
    //       </motion.div>
    //     </div>
    //   </motion.div>

    //   <Footer />
    // </div>

    <div className="bg-white w-full">
      <section className="p-3 md:p-5 lg:p-10 mb-[95px] md:mb-[300px]">
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
            <div id="logo" className="flex gap-2 items-center">
              <Image
                src="/abuadLogo.png"
                alt="Abuad Logo"
                width={25}
                height={25}
              />
              <Image
                src="/asva logo.png"
                alt="Asva Logo"
                width={25}
                height={25}
              />
              <h1 className="font-semibold text-xl text-white">ASVA HUB</h1>
            </div>
            <div
              id="content"
              className={` items-center
    md:flex-row md:static md:bg-transparent md:w-auto hidden md:flex gap-10
  `}
            >
              <Link href="/" className={`font-normal text-[16px] text-white `}>
                Features
              </Link>
              <Link href="/" className={`font-normal text-[16px] text-white`}>
                Integration
              </Link>
              <Link href="/" className={`font-normal text-[16px] text-white`}>
                Contact Us
              </Link>
              <Link href="/" className={`font-normal text-[16px] text-white`}>
                About Us
              </Link>
            </div>
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
                    href="/"
                    className="font-normal text-[16px] text-[#050E3F]"
                  >
                    Features
                  </Link>
                  <Link
                    href="/"
                    className="font-normal text-[16px] text-[#050E3F]"
                  >
                    Integration
                  </Link>
                  <Link
                    href="/"
                    className="font-normal text-[16px] text-[#050E3F]"
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/"
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
            </div>
            <button
              aria-label="Toggle navigation menu"
              className="md:hidden text-white"
              onClick={() => setOpenBar(!openBar)}
            >
              {openBar ? <X /> : <Menu />}
            </button>
          </nav>
          <section className="mt-10 flex flex-col justify-center items-center">
            <h1
              className={` ${darkerGrotesque.className}
  font-semibold
  text-3xl md:text-4xl lg:text-[96px]
  leading-tight lg:leading-[81px]
  text-center text-white mb-3 sm:mb-5
`}
            >
              Your On-campus Cloud <br />
              Storage Solution
            </h1>
            <p
              className="
  text-sm sm:text-base md:text-base lg:text-[20px]
  text-center text-white mb-8 px-2
"
            >
              Every resource needed in one place. Accessible anytime and
              anywhere.
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

          {/* <div
          className="
                  absolute
                  w-[90%] sm:w-[80%] lg:w-[840px]
                  aspect-video
                  bottom-[-50px] sm:bottom-[-100px] lg:bottom-[-280px]
                  left-1/2 -translate-x-1/2
                  rounded-[15px]
                  border border-white
                  shadow-[0_10px_40px_14px_rgba(0,0,0,0.2)]
                "
        >
          <Image
            src="/preview.png"
            alt="Preview"
            fill
            className="rounded-[15px] object-cover"
          />
        </div> */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="
    relative
    w-[90%] sm:w-[80%] lg:w-[840px]
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
      <section className="flex flex-wrap gap-8 mb-10 justify-center p-3 md:p-10 lg:gap-32">
        {features.map((feature, index) => {
          const Icon = iconMap[feature.icon];

          return (
            <motion.div
              key={feature.title}
              initial={{
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
              }}
              className="border border-[#D1D1D1] bg-gradient-to-b from-[#F6F6F6] to-white rounded-2xl p-5 w-full md:w-[400px] h-[260px]"
            >
              <div className="mb-4">
                <Icon className="h-8 w-8 text-[#0AFEF2] bg-[#050E3F] px-1 py-1 text-center rounded-[5px]" />
              </div>

              <h3 className="text-xl font-semibold mb-2 text-[#050E3F]">
                {feature.title}
              </h3>

              <p className="text-base text-[#050E3F]">{feature.description}</p>
            </motion.div>
          );
        })}
      </section>

      <section className=" p-2 mb-10">
        <h1
          className={`${darkerGrotesque.className} font-semibold text-[#050E3F] text-3xl lg:text-7xl text-center`}
        >
          Why Asva Drive?
        </h1>
        <p className="text-[#050E3F] font-normal text-sm lg:text-xl text-center mt-5 mb-10">
          Every resource content needed in one place. Accessible anytime and
          anywhere.
        </p>

        <div className="flex items-center justify-center overflow-x-hidden [@media(min-width:0px)_and_(max-width:600px)]:flex-wrap  mb-7">
          <motion.div
            id="text"
            className="sm:w-[433px] w-full text-[#050E3F] [@media(min-width:601px)_and_(max-width:1023px)]:ml-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <p className="[@media(min-width:0px)_and_(max-width:600px)]:text-center sm:text-justify font-medium text-sm md:text-xl lg:text-2xl [@media(min-width:1024px)_and_(max-width:1100px)]:text-xl">
              We created this custom drive specifically for university students
              who need reliable, portable access to their academic life. Whether
              you&apos;re working in the library, collaborating in study groups,
              or switching between campus computers and your laptop, this drive
              keeps everything you need in one place.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="
          relative
                  w-[500px] lg:w-[50%]
                  aspect-[14/9]
                  rounded-[15px]
                  border border-white
                  shadow-[0_10px_40px_14px_rgba(0,0,0,0.2)]
                  mt-7
                  mb-5
                  lg:-right-[295px]
                  [@media(min-width:1024px)_and_(max-width:1100px)]:-right-36
                  [@media(min-width:601px)_and_(max-width:1023px)]:-right-24
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

        <div className="flex items-center justify-center overflow-x-hidden [@media(min-width:900px)_and_(max-width:1023px)]:  [@media(min-width:0px)_and_(max-width:600px)]:flex-wrap-reverse">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            className="
          relative
                  w-[500px] lg:w-[50%]
                  aspect-[14/9]
                  rounded-[15px]
                  border border-white
                  shadow-[0_10px_40px_14px_rgba(0,0,0,0.2)]
                  mt-7
                  mb-20
                  lg:-left-[295px]
                  [@media(min-width:1024px)_and_(max-width:1100px)]:-left-36
                  [@media(min-width:601px)_and_(max-width:1023px)]:-left-24
                "
          >
            <Image
              src="/preview.webp"
              alt="Preview"
              fill
              className="rounded-[15px] object-cover"
            />
          </motion.div>
          <motion.div
            id="text"
            className="sm:w-[433px] w-full text-[#050E3F] [@media(min-width:601px)_and_(max-width:1023px)]:ml-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
          >
            <p className="[@media(min-width:0px)_and_(max-width:600px)]:text-center sm:text-justify font-medium text-sm md:text-xl lg:text-2xl [@media(min-width:1024px)_and_(max-width:1100px)]:text-xl">
              Inside, you&apos;ll find curated educational resources, essential
              productivity tools, and pre-organized folders designed around the
              reality of university life—tight deadlines, multiple projects, and
              the constant juggle between classes, assignments, and exams. No
              more scrambling to find that one file or wondering if you have the
              right version of your essay.
            </p>
          </motion.div>
        </div>

          <motion.div
            className="w-full flex justify-center"
          >
            <Link
              href="/signup"
              className="py-2 px-5 bg-[#0AFEF2] text-[#050E3F] text-[16px] md:text-[24px] rounded-[5px] font-semibold"
            >
              Get Started
            </Link>
          </motion.div>
      </section>

      <section className="bg-[radial-gradient(ellipse_at_center,#02427E_0%,#050E3F_100%)] overflow-hidden relative">
        <div className="hidden lg:block absolute w-[300px] h-[300px] top-10 right-[74px] rounded-full bg-[#0AFEF2] blur-[184px] [@media(min-width:1024px)_and_(max-width:1200px)]:right-[20px]" />

        <div className="hidden lg:block absolute w-[300px] h-[250px] top-44 left-[74px] rounded-full bg-[#0AFEF2] blur-[184px] [@media(min-width:1024px)_and_(max-width:1200px)]:left-[20px]" />
        <div className="w-full flex p-3 md:p-5 lg:p-10 flex-wrap mb-32">
          <h1 className="w-full lg:w-[50%] font-bold text-3xl lg:text-[65px] text-white mb-5 text-center lg:text-left">
            Frequently <br />
            Asked Questions
          </h1>
          <Accordion
            type="single"
            collapsible
            className="w-full lg:w-[50%] mx-auto"
          >
            {faqData.map((item: FAQItem) => (
              <AccordionItem
                key={item.id}
                value={`item-${item.id}`}
                className="border-b border-white/30 mb-7"
              >
                <AccordionTrigger
                  className="
              group
              flex items-center justify-between
              text-left text-white text-lg font-medium
              hover:no-underline
              [&>svg]:hidden
            "
                >
                  <span className="text-lg md:text-2xl">{item.question}</span>

                  {/* Plus / Minus Icons */}
                  <span className="ml-4 flex-shrink-0">
                    <Plus className="h-5 w-5 text-[#03C157] group-data-[state=open]:hidden" />
                    <Minus className="h-5 w-5 text-[#03C157] hidden group-data-[state=open]:block" />
                  </span>
                </AccordionTrigger>

                <AccordionContent className="text-white/80 text-sm md:text-lg leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        <footer className="w-full relative">
          <div className="absolute -bottom-[50px] lg:-bottom-24 flex flex-col justify-center w-full">
            <p className="text-sm md:text-base text-[#FFFFFF6B] font-medium text-center lg:-mb-20">
              Copyright ASVA 2025. All rights reserved.
            </p>
            <h1 className="font-semibold text-[100px] md:text-[100px] lg:text-[200px] text-center text-[#FFFFFFC2] tracking-wider">
              Asva
            </h1>
          </div>
        </footer>
      </section>
    </div>
  );
};

export default Home;
