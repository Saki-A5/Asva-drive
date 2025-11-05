// utils/fileSizes.ts
const UNIT_MULTIPLIERS: Record<string, number> = {
  b: 1,
  bytes: 1,
  kb: 1024,
  mb: 1024 ** 2,
  gb: 1024 ** 3,
  tb: 1024 ** 4,
}

/**
 * Parse a size (number | string | Number) to bytes (number).
 */
export const parseSizeToBytes = (size: number | string | Number | undefined | null): number => {
  if (size === undefined || size === null) return 0

  // handle Number object and primitive number
  if (typeof size === "number") return Number(size)
  if (size instanceof Number) return Number(size.valueOf())

  // handle string
  if (typeof size === "string") {
    const trimmed = size.trim()

    // if it's a plain number string, assume bytes (or KB depending on your app) — choose bytes here
    // If your app uses KB as base, convert accordingly (see note below).
    const plainNumberMatch = trimmed.match(/^(\d+(\.\d+)?)$/)
    if (plainNumberMatch) {
      return parseFloat(plainNumberMatch[1])
    }

    // regex for value + unit, e.g. "1.5 MB", "1536 KB", "512B"
    const m = trimmed.match(/^([\d,.]+)\s*([a-zA-Z]+)$/)
    if (!m) {
      // fallback: attempt to parse floats
      const v = parseFloat(trimmed.replace(/,/g, ""))
      return Number.isFinite(v) ? v : 0
    }

    const value = parseFloat(m[1].replace(/,/g, ""))
    const unitRaw = m[2].toLowerCase()

    // normalize unit variants
    let unit = unitRaw
      .replace(/\./g, "")
      .replace(/s$/, "") // remove plural: "bytes" -> "byte"
      .trim()

    // handle common aliases
    if (unit === "b" || unit === "bytes" || unit === "byte") unit = "b"
    if (unit === "kb" || unit === "k") unit = "kb"
    if (unit === "mb" || unit === "m") unit = "mb"
    if (unit === "gb" || unit === "g") unit = "gb"
    if (unit === "tb" || unit === "t") unit = "tb"

    const multiplier = UNIT_MULTIPLIERS[unit] ?? 1
    return value * multiplier
  }

  // fallback
  return 0
}

/**
 * Format bytes into KB/MB/GB friendly string.
 * Input assumed to be bytes (number).
 */
export const formatFileSize = (size : number | string): string => {
      const bytes = typeof size === "string" ? parseFloat(size) : size
      if (isNaN(bytes)) return "0 KB"
      if (bytes < 1024) return `${bytes} KB`
      const mb = bytes / 1024
      if (mb < 1024 ) return `${mb.toFixed(2)} MB`
      const gb = mb / 1024
      if (gb < 1024 ) return `${gb.toFixed(2)} GB`
      const tb = gb / 1024
      return `${tb.toFixed(2)} TB`
    }
