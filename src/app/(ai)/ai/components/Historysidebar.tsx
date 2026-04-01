"use client";
import React, { useState } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  MessageSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Chat = {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
};

const defaultChats: Chat[] = [
  {
    id: "1",
    title: "CSC 415 - OS Notes",
    preview: "Explain virtual memory...",
    timestamp: "Today",
  },
  {
    id: "2",
    title: "CSC 407 - Networking",
    preview: "What is TCP/IP?",
    timestamp: "Today",
  },
  {
    id: "3",
    title: "Data Structures Help",
    preview: "How does a red-black tree...",
    timestamp: "Yesterday",
  },
  {
    id: "4",
    title: "Algorithm Analysis",
    preview: "Big O notation for merge sort...",
    timestamp: "Yesterday",
  },
  {
    id: "5",
    title: "Database Design",
    preview: "Explain normalization...",
    timestamp: "Mon",
  },
];

export default function HistorySidebar({
  onClose,
  onNewChat,
}: {
  onClose?: () => void;
  onNewChat?: () => void;
}) {
  const [chats, setChats] = useState<Chat[]>(defaultChats);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string>("1");

  const filtered = chats.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.preview.toLowerCase().includes(search.toLowerCase()),
  );

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId("");
  };

  /* ── COLLAPSED ── */
  if (collapsed) {
    return (
      <div className="flex flex-col items-center h-full w-14 bg-gradient-to-b from-[#02427E] to-[#05081A] text-white py-4 gap-4">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <button
          onClick={onNewChat}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="New chat"
        >
          <Plus className="h-4 w-4" />
        </button>
        <div className="flex flex-col gap-3 flex-1 items-center mt-1 overflow-hidden">
          {chats.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              title={c.title}
              className={`p-1.5 rounded-lg transition-colors ${
                activeId === c.id ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── EXPANDED ── */
  return (
    <div className="flex flex-col h-full w-64 sm:w-56 bg-gradient-to-b from-[#02427E] to-[#05081A] text-white p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/"
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Back to home"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-1.5">
          <Image
            src="/asva logo.png"
            alt="ASVA Logo"
            width={20}
            height={20}
            className="h-5 w-5"
          />
          <span className="text-sm font-semibold tracking-wide">ASVA AI</span>
        </div>

        {/* Mobile: X | Desktop: collapse */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors md:hidden"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors hidden md:flex"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat button */}
      <button
        onClick={onNewChat}
        className="flex items-center gap-2 w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-3 py-2 text-xs font-semibold transition-colors mb-3"
      >
        <Plus className="h-3.5 w-3.5" />
        New Chat
      </button>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:bg-white/15 transition-colors"
        />
      </div>

      {/* Chat history list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 -mx-1">
        {filtered.length > 0 ? (
          <>
            {/* Group by timestamp */}
            {["Today", "Yesterday"].map((group) => {
              const grouped = filtered.filter((c) => c.timestamp === group);
              if (grouped.length === 0) return null;
              return (
                <div key={group} className="mb-2">
                  <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider px-2 mb-1">
                    {group}
                  </p>
                  {grouped.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      active={activeId === chat.id}
                      onSelect={() => setActiveId(chat.id)}
                      onDelete={deleteChat}
                    />
                  ))}
                </div>
              );
            })}
            {/* Older chats */}
            {filtered.filter(
              (c) => c.timestamp !== "Today" && c.timestamp !== "Yesterday",
            ).length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-wider px-2 mb-1">
                  Older
                </p>
                {filtered
                  .filter(
                    (c) =>
                      c.timestamp !== "Today" && c.timestamp !== "Yesterday",
                  )
                  .map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      active={activeId === chat.id}
                      onSelect={() => setActiveId(chat.id)}
                      onDelete={deleteChat}
                    />
                  ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-xs text-white/40 text-center mt-8">
            No chats found
          </p>
        )}
      </div>
    </div>
  );
}

function ChatItem({
  chat,
  active,
  onSelect,
  onDelete,
}: {
  chat: Chat;
  active: boolean;
  onSelect: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group w-full flex items-start gap-2 px-2 py-2 rounded-lg transition-colors text-left ${
        active ? "bg-white/20" : "hover:bg-white/10"
      }`}
    >
      <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-white/60" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate text-white">{chat.title}</p>
        <p className="text-[10px] text-white/50 truncate">{chat.preview}</p>
      </div>
      {hovered && (
        <button
          onClick={(e) => onDelete(chat.id, e)}
          className="p-0.5 rounded hover:bg-white/20 transition-colors shrink-0"
          title="Delete chat"
        >
          <Trash2 className="h-3 w-3 text-white/50 hover:text-red-400 transition-colors" />
        </button>
      )}
    </button>
  );
}
