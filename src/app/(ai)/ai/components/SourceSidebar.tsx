"use client";
import React, { useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import SourcesUploadModal from "./SourceUploadModal";
import Link from "next/link";
import Image from "next/image";

type Source = {
  id: string;
  label: string;
};

const defaultSources: Source[] = [
  { id: "1", label: "CSC 415 Completed..." },
  { id: "2", label: "CSC 407 - netcentric..." },
];

const DocIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <rect x="1" y="1" width="6" height="6" rx="1" fill="#22d3ee" />
    <rect x="9" y="1" width="6" height="6" rx="1" fill="#22d3ee" />
    <rect x="1" y="9" width="6" height="6" rx="1" fill="#22d3ee" />
    <rect x="9" y="9" width="6" height="6" rx="1" fill="#22d3ee" />
  </svg>
);

const Checkbox = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) => (
  <button
    onClick={onChange}
    className={`w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
      checked
        ? "bg-[#22d3ee] border-[#22d3ee]"
        : "border-white/40 bg-transparent"
    }`}
    aria-checked={checked}
    role="checkbox"
  >
    {checked && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6l3 3 5-5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

export default function SourcesSidebar() {
  const [sources, setSources] = useState<Source[]>(defaultSources);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    new Set(defaultSources.map((s) => s.id)),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const allChecked = checkedIds.size === sources.length;

  const toggleAll = () => {
    if (allChecked) setCheckedIds(new Set());
    else setCheckedIds(new Set(sources.map((s) => s.id)));
  };

  const toggleOne = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── COLLAPSED STATE ── */
  if (collapsed) {
    return (
      <div className="flex flex-col items-center h-full w-14 bg-gradient-to-b from-[#02427E] to-[#05081A] text-white py-4 gap-4">
        {/* Expand button */}
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>

        {/* Doc icons for each source */}
        <div className="flex flex-col gap-3 flex-1 items-center mt-2">
          {sources.map((source) => (
            <div key={source.id} title={source.label}>
              <DocIcon />
            </div>
          ))}
        </div>

        {/* Add sources icon */}
        <button
          onClick={() => setModalOpen(true)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Add sources"
        >
          <Plus className="h-4 w-4" />
        </button>

        <SourcesUploadModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onFilesSelected={(files) => {
            const newSources = files.map((f) => ({
              id: Date.now().toString() + f.name,
              label: f.name,
            }));
            setSources((prev) => [...prev, ...newSources]);
            setCheckedIds((prev) => {
              const next = new Set(prev);
              newSources.forEach((s) => next.add(s.id));
              return next;
            });
          }}
        />
      </div>
    );
  }

  /* ── EXPANDED STATE ── */
  return (
    <div className="flex flex-col h-full w-56 bg-gradient-to-b from-[#02427E] to-[#05081A] text-white p-4">
      {/* Top bar: back button + logo + collapse */}
      <div className="flex items-center justify-between mb-4">
        {/* Back to home */}
        <Link
          href="/"
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Back to home"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {/* Logo + name */}
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

        {/* Collapse button */}
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* Sources header */}
      <h2 className="text-base font-bold mb-3 tracking-wide">Sources</h2>

      {/* Select all row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs text-white/70">Select all sources</span>
        <Checkbox checked={allChecked} onChange={toggleAll} />
      </div>

      {/* Source list */}
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {sources.map((source) => (
          <div
            key={source.id}
            className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <DocIcon />
              <span className="text-xs truncate">{source.label}</span>
            </div>
            <Checkbox
              checked={checkedIds.has(source.id)}
              onChange={() => toggleOne(source.id)}
            />
          </div>
        ))}
      </div>

      {/* Add Sources button */}
      <button
        onClick={() => setModalOpen(true)}
        className="mt-4 flex items-center justify-center gap-2 w-full border border-white/30 rounded-xl py-2 text-xs font-semibold hover:bg-white/10 transition-colors"
      >
        Add Sources <Plus className="h-3.5 w-3.5" />
      </button>

      <SourcesUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onFilesSelected={(files) => {
          const newSources = files.map((f) => ({
            id: Date.now().toString() + f.name,
            label: f.name,
          }));
          setSources((prev) => [...prev, ...newSources]);
          setCheckedIds((prev) => {
            const next = new Set(prev);
            newSources.forEach((s) => next.add(s.id));
            return next;
          });
        }}
      />
    </div>
  );
}
