"use client";
import React, { useState } from "react";
import SourcesSidebar from "./components/SourceSidebar";
import ChatArea from "./components/Chatarea";
import ModeInfoPanel from "./components/ModeInfoPanel";
import { PanelLeftOpen } from "lucide-react";

type Mode = "Socratic" | "Standard" | "Explain";

export default function AiPage() {
  const [currentMode, setCurrentMode] = useState<Mode>("Socratic");
  const [showModePanel, setShowModePanel] = useState(false);
  const [showSourcesDrawer, setShowSourcesDrawer] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#02427E] to-[#05081A] gap-2 p-2 md:gap-3 md:p-3">
      {/* ── MOBILE: Sources drawer overlay ── */}
      {showSourcesDrawer && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setShowSourcesDrawer(false)}
        />
      )}
      <div
        className={`
          fixed top-0 left-0 h-full z-50 transition-transform duration-300 md:hidden
          ${showSourcesDrawer ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SourcesSidebar onClose={() => setShowSourcesDrawer(false)} />
      </div>

      {/* ── DESKTOP: Sources panel (always visible md+) ── */}
      <div className="hidden md:flex shrink-0 h-full rounded-2xl overflow-hidden">
        <SourcesSidebar />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 h-full min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 md:hidden mb-2">
          <button
            onClick={() => setShowSourcesDrawer(true)}
            className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Open sources"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
          <span className="text-white text-sm font-semibold">ASVA AI</span>
        </div>

        {/* Chat + Mode panel row */}
        <div className="flex flex-1 min-h-0 gap-2 md:gap-3">
          {/* Chat area */}
          <div className="flex-1 h-full min-w-0 bg-white rounded-2xl overflow-hidden shadow-sm">
            <ChatArea
              onModeChange={(m) => {
                setCurrentMode(m);
                setShowModePanel(true);
              }}
            />
          </div>

          {/* Mode info panel — hidden on mobile, shown on lg+ when active */}
          {showModePanel && (
            <div className="hidden lg:flex shrink-0 h-full rounded-2xl overflow-hidden shadow-sm">
              <ModeInfoPanel
                mode={currentMode}
                onClose={() => setShowModePanel(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mode info panel — mobile bottom sheet */}
      {showModePanel && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
          <div className="bg-white rounded-t-2xl shadow-xl p-5 mx-2 mb-0">
            <ModeInfoPanel
              mode={currentMode}
              onClose={() => setShowModePanel(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
