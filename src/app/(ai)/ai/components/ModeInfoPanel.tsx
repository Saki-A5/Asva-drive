"use client";
import React from "react";
import { PanelRight } from "lucide-react";

type ModeInfo = {
  title: string;
  description: string;
};

const modeDetails: Record<string, ModeInfo> = {
  Socratic: {
    title: "Socratic Mode",
    description:
      "This mode is more about guiding thinking. Instead of dumping answers, the AI asks questions, gives hints, and helps students reason things out step by step. Explanations only come when the student actually asks for them.",
  },
  Standard: {
    title: "Standard Mode",
    description:
      "The AI responds directly and thoroughly to your questions. Best for getting quick answers, summaries, and explanations without the back-and-forth.",
  },
  Explain: {
    title: "Explain Mode",
    description:
      "The AI breaks down complex topics into simple, easy-to-understand explanations. Perfect for learning new concepts or clarifying difficult material.",
  },
};

export default function ModeInfoPanel({
  mode = "Socratic",
  onClose,
}: {
  mode?: string;
  onClose?: () => void;
}) {
  const info = modeDetails[mode] ?? modeDetails["Socratic"];

  return (
    <div className="flex flex-col h-full bg-white text-gray-900 w-72 p-5 rounded-2xl shadow-sm">
      {/* Top bar */}
      <div className="flex items-start justify-between mb-4">
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Close panel"
        >
          <PanelRight className="h-5 w-5" />
        </button>
        {/* Avatar placeholder */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#02427E] to-[#22d3ee] flex items-center justify-center text-white text-xs font-bold">
          U
        </div>
      </div>

      {/* Mode info */}
      <h2 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h2>
      <p className="text-sm text-gray-500 leading-relaxed">
        {info.description}
      </p>
    </div>
  );
}
