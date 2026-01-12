import Image from "next/image";
import { Sparkles } from "lucide-react";
export default function AiFeature() {
  return (
    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
      <div className="order-2 md:order-1 bg-slate-100 rounded-3xl aspect-video shadow-2xl border border-slate-200 flex items-center justify-center text-slate-400 italic relative">
        <Image
          src="/AIChat.webp"
          alt="Ai chat preview"
          fill
          className="rounded-3xl"
        />
      </div>
      <div className="order-1 md:order-2">
        <div className="w-12 h-12 bg-[radial-gradient(ellipse_at_center,#02427E_0%,#050E3F_100%)] text-white rounded-xl flex items-center justify-center mb-6 dark:bg-none dark:text-[#0AFEF2]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
          Built-in AI Assistant
        </h3>
        <p className="text-lg text-slate-600 leading-relaxed mb-6 dark:text-white">
          Stop spending hours reading 50-page research papers. Our integrated AI
          lives inside your drive to help you process information faster.
        </p>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-purple-500 font-bold mt-1">→</span>
            <span>
              <strong>PDF Summarization:</strong> Get the core arguments of any
              document in seconds.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-purple-500 font-bold mt-1">→</span>
            <span>
              <strong>Exam Prep:</strong> Ask the AI to generate practice
              questions based on your uploaded lecture notes.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
