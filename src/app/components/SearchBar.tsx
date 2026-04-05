"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import axios, { CancelTokenSource } from "axios";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  localResultsCount?: number; // 👈 number of results in current table
  placeholder?: string;
}

const SearchBar = ({
  value,
  onChange,
  localResultsCount = 0,
  placeholder = "Search...",
}: SearchBarProps) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    onChange(input);
    setActiveIndex(-1);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (cancelTokenRef.current) cancelTokenRef.current.cancel();

    if (!input.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);

        cancelTokenRef.current = axios.CancelToken.source();

        const res = await axios.get(
          `/api/search?q=${encodeURIComponent(input)}&limit=8`,
          { cancelToken: cancelTokenRef.current.token }
        );

        const data = res.data || [];

        setResults(data);
        if (localResultsCount === 0 && data.length > 0) {
          setShowDropdown(true);
        } else {
          setShowDropdown(false);
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Search error", err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      const selected = results[activeIndex];

      if (selected.cloudinaryUrl) {
        window.open(selected.cloudinaryUrl, "_blank");
      }

      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10" />

      <Input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full pl-12 h-11 bg-secondary rounded-4xl"
        autoComplete="off"
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
          {loading && (
            <div className="px-4 py-2 text-gray-400">
              Searching globally...
            </div>
          )}

          {!loading &&
            results.map((item, index) => (
              <Link
                key={item.ObjectId}
                href={item.cloudinaryUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={`block px-4 py-2 text-black truncate cursor-pointer ${
                  index === activeIndex
                    ? "bg-gray-200"
                    : "hover:bg-gray-100"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <span className="font-medium">{item.filename}</span>

                {item.tags?.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    [{item.tags.join(", ")}]
                  </span>
                )}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
