import Image from "next/image";
import Hero from "../components/Hero";
import ContactForm from "../components/ContactForm";
import { Folder, Share2, Sparkles } from "lucide-react";
import AiFeature from "../components/AiFeatureCom";
import SeamlessSharing from "../components/SeamlessSharing";
import IntelligentOrganization from "../components/IntelligentOrganization";

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-900 scroll-smooth dark:bg-black dark:text-white">
      <Hero />

      {/* DETAILED FEATURES SECTION */}
      <section id="features" className="py-24 space-y-32">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
            Everything You Need to Excel
          </h2>
          <p className="mt-4 text-slate-500 italic ">
            Scroll to explore our core capabilities
          </p>
        </div>

        {/* Feature 1: Intelligent Organization */}
        <IntelligentOrganization/>

        {/* Feature 2: AI Assistance */}
        <AiFeature/>

        {/* Feature 3: Seamless Sharing */}
        <SeamlessSharing/>
      </section>

      {/* ABOUT US SECTION */}
      {/* <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8">About ASVA HUB</h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            ASVA HUB was founded by a group of students who tired of the
            "USB-drive era" and the limitations of generic cloud storage. We
            realized that campus life has specific needs: high-speed local
            transfers, academic file-type support, and AI tools that actually
            help with studying.
          </p>
          <div className="mt-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-left">
            <h4 className="font-bold text-sky-800 mb-2">Our Vision</h4>
            <p className="text-slate-600 italic font-serif">
              "To create a digital ecosystem where every student's academic
              resources are organized, protected, and enhanced by technology,
              allowing them to focus entirely on their growth."
            </p>
          </div>
        </div>
      </section> */}

      {/* CONTACT SECTION */}
      <section
        id="contact"
        className="py-24 max-w-7xl mx-auto px-6 flex justify-center flex-col items-center"
      >
        <ContactForm />
      </section>

      <section className="bg-[radial-gradient(ellipse_at_center,#02427E_0%,#050E3F_100%)] overflow-hidden relative p-4">
        <div className="hidden lg:block absolute w-[300px] h-[300px] top-10 right-[74px] rounded-full bg-[#0AFEF2] blur-[184px] [@media(min-width:1024px)_and_(max-width:1200px)]:right-[20px]" />

        <div className="hidden lg:block absolute w-[300px] h-[250px] top-44 left-[74px] rounded-full bg-[#0AFEF2] blur-[184px] [@media(min-width:1024px)_and_(max-width:1200px)]:left-[20px]" />
        <div className="w-full flex p-3 md:p-5 lg:p-10 flex-wrap mb-32"></div>
        <footer className="w-full relative">
          <div className="absolute -bottom-[65px] lg:-bottom-[110px] flex flex-col justify-center w-full">
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
}
