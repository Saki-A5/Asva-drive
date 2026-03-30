"use client";
import React, { useState } from "react";
import SourcesSidebar from "./components/SourceSidebar";
import ChatArea from "./components/Chatarea";
import ModeInfoPanel from "./components/ModeInfoPanel";

type Mode = "Socratic" | "Standard" | "Explain";

export default function AiPage() {
  const [currentMode, setCurrentMode] = useState<Mode>("Socratic");
  const [showModePanel, setShowModePanel] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-br from-[#02427E] to-[#05081A] gap-3 p-3">
      {/* Sources panel */}
      <div className="shrink-0 h-full rounded-2xl overflow-hidden">
        <SourcesSidebar />
      </div>

      {/* Chat area — fills remaining space */}
      <div className="flex-1 h-full min-w-0 bg-white rounded-2xl overflow-hidden shadow-sm">
        <ChatArea
          onModeChange={(m) => {
            setCurrentMode(m);
            setShowModePanel(true);
          }}
        />
      </div>

      {/* Mode info panel */}
      {showModePanel && (
        <div className="shrink-0 h-full rounded-2xl overflow-hidden shadow-sm">
          <ModeInfoPanel
            mode={currentMode}
            onClose={() => setShowModePanel(false)}
          />
        </div>
      )}
    </div>
  );
}
