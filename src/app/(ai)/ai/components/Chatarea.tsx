"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, ChevronDown } from "lucide-react";

type Mode = "Socratic" | "Standard" | "Explain";
const modes: Mode[] = ["Socratic", "Standard", "Explain"];

type Message = { id: string; role: "user" | "assistant"; content: string };

export default function ChatArea({
  onModeChange,
}: {
  onModeChange?: (mode: Mode) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("Socratic");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowModeMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectMode = (m: Mode) => {
    setMode(m);
    setShowModeMenu(false);
    onModeChange?.(m);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: text },
    ]);
    setInput("");
    setLoading(true);
    try {
      // ---------------------------------------------------------------
      // TODO: Replace with your own LLM API call.
      //   const res = await fetch("/api/chat", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ messages, mode }),
      //   });
      //   const data = await res.json();
      //   const reply = data.reply;
      // ---------------------------------------------------------------
      const reply = ""; // ← replace with your LLM response
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="w-full px-4 sm:px-6 py-3 border-b border-gray-100">
        <h1 className="text-sm font-semibold text-gray-800">Chat</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-4 sm:py-6">
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center text-center mt-24 sm:mt-40">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                Welcome to ASVA AI
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                Create summaries and projects with our different modes
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:gap-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#02427E] text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="w-full px-3 sm:px-6 pb-3 sm:pb-5 pt-2 sm:pt-3 border-t border-gray-100">
        <div className="mx-auto w-full max-w-3xl">
          <div className="flex items-end gap-2 border border-gray-200 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 bg-white shadow-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 resize-none text-xs sm:text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent max-h-32 leading-relaxed"
              style={{ overflow: "hidden" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <div className="relative flex-shrink-0" ref={menuRef}>
              <button
                onClick={() => setShowModeMenu((v) => !v)}
                className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium"
              >
                {mode}
                <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              {showModeMenu && (
                <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-32 sm:w-36 z-50">
                  {modes.map((m) => (
                    <button
                      key={m}
                      onClick={() => selectMode(m)}
                      className={`w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${
                        m === mode
                          ? "text-[#02427E] font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 text-gray-400 hover:text-[#02427E] disabled:opacity-40 transition-colors"
              aria-label="Send"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
