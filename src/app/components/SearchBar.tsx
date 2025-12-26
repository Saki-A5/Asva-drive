"use client";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import axios, { CancelTokenSource } from "axios";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (cancelTokenRef.current) cancelTokenRef.current.cancel(); // cancel previous request

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);

    timeoutRef.current = setTimeout(() => {
      cancelTokenRef.current = axios.CancelToken.source();

      axios.get(`/api/search?q=${encodeURIComponent(value)}&limit=8`, {
        cancelToken: cancelTokenRef.current.token,
      })
        .then(res => {
          setResults(res.data.hits || []);
          setShowDropdown(true);
        })
        .catch(err => {
          if (!axios.isCancel(err)) setResults([]);
        })
        .finally(() => setLoading(false));
    }, 300);
  };

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      const selected = results[activeIndex];
      if (selected.cloudinaryUrl) window.open(selected.cloudinaryUrl, "_blank");
      setShowDropdown(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white z-10" />
      <Input
        type="search"
        placeholder="Search for anything"
        className="w-full pl-12 h-11 bg-secondary rounded-4xl"
        value={query}
        onChange={handleChange}
        onFocus={() => query && setShowDropdown(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
          {loading && <div className="px-4 py-2 text-gray-400">Loading...</div>}
          {!loading && results.length === 0 && (
            <div className="px-4 py-2 text-gray-400">No results found</div>
          )}
          {!loading && results.map((item, index) => (
            <Link
              href={item.cloudinaryUrl || '#'}
              key={item.id}
              className={`block px-4 py-2 text-black truncate cursor-pointer ${
                index === activeIndex ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
              target="_blank"
              rel="noopener noreferrer"
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
