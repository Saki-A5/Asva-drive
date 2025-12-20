"use client"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import axios from "axios"

const SearchBar = () => {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (value.trim().length === 0) {
      setResults([])
      setShowDropdown(false)
      return
    }
    setLoading(true)
    timeoutRef.current = setTimeout(() => {
      axios.get(`/api/search?q=${encodeURIComponent(value)}&limit=8`)
        .then(res => {
          setResults(res.data.hits || [])
          setShowDropdown(true)
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
  }

  const handleBlur = () => {
    setTimeout(() => setShowDropdown(false), 150)
  }

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
        autoComplete="off"
      />
      {showDropdown && results.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 max-h-72 overflow-y-auto">
          {results.map((item) => (
            <Link
              href={item.cloudinaryUrl || '#'}
              key={item.id}
              className="block px-4 py-2 hover:bg-gray-100 text-black truncate"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="font-medium">{item.filename}</span>
              {item.tags && item.tags.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">[{item.tags.join(", ")}]</span>
              )}
            </Link>
          ))}
          {loading && <div className="px-4 py-2 text-gray-400">Loading...</div>}
        </div>
      )}
      {showDropdown && !loading && results.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-20 px-4 py-2 text-gray-400">
          No results found
        </div>
      )}
    </div>
  )
}

export default SearchBar