"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  ChevronDown,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

type Mode = "Socratic" | "Standard" | "Explain";
const modes: Mode[] = ["Socratic", "Standard", "Explain"];

type Message = { id: string; role: "user" | "assistant"; content: string };

type AttachedFile = { id: string; name: string; type: string; size: string };

function fileIcon(type: string) {
  if (type.startsWith("image/"))
    return <ImageIcon className="h-3.5 w-3.5 text-blue-400" />;
  return <FileText className="h-3.5 w-3.5 text-blue-400" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newFiles: AttachedFile[] = files.map((f) => ({
      id: Date.now().toString() + f.name,
      name: f.name,
      type: f.type,
      size: formatSize(f.size),
    }));
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeFile = (id: string) =>
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));

  const sendMessage = async () => {
    const text = input.trim();
    if (!text && attachedFiles.length === 0) return;
    if (loading) return;

    const content = [
      text,
      attachedFiles.length > 0
        ? `[Attached: ${attachedFiles.map((f) => f.name).join(", ")}]`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content },
    ]);
    setInput("");
    setAttachedFiles([]);
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

  const canSend =
    (input.trim().length > 0 || attachedFiles.length > 0) && !loading;

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

      {/* Input area */}
      <div className="w-full px-3 sm:px-6 pb-3 sm:pb-5 pt-2 sm:pt-3 border-t border-gray-100">
        <div className="mx-auto w-full max-w-3xl">
          <div className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            {/* Attached files preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pt-3">
                {attachedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1.5 max-w-[160px]"
                  >
                    {fileIcon(f.type)}
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-gray-700 truncate">
                        {f.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{f.size}</p>
                    </div>
                    <button
                      onClick={() => removeFile(f.id)}
                      className="ml-1 text-gray-400 hover:text-gray-600 shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Text input row */}
            <div className="flex items-end gap-2 px-3 sm:px-4 py-2 sm:py-3">
              {/* Paperclip */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 text-gray-400 hover:text-[#02427E] transition-colors pb-0.5"
                aria-label="Attach file"
                title="Attach file"
              >
                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpeg,.jpg,.png,.pdf,.docx,.mp3,.mp4,.txt,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />

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

              {/* Mode selector */}
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

              {/* Send */}
              <button
                onClick={sendMessage}
                disabled={!canSend}
                className="flex-shrink-0 text-gray-400 hover:text-[#02427E] disabled:opacity-40 transition-colors"
                aria-label="Send"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
