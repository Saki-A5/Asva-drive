export type FileModel = {
  id?: string | number;
  name: string;
  modifiedDate?: string | null;
  size?: number | string | null; // numeric value or a string like "1.5 MB" or just number
  sizeUnit?: "B" | "KB" | "MB" | "GB" | null;
  [key: string]: any;
};

const UNIT_MAP: Record<string, number> = {
  B: 1,
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
};

export const parseSizeToBytes = (
  size: number | string | undefined | null,
  unit?: string | null
): number => {
  if (size == null || size === "") return 0;

  // If size is a number and unit provided
  if (typeof size === "number") {
    const u = (unit || "B").toUpperCase();
    return size * (UNIT_MAP[u] || 1);
  }

  // If size is a string, try to parse patterns like "1.5 MB", "1024KB", "500"
  if (typeof size === "string") {
    const trimmed = size.trim();
    // match number and optional unit
    const m = trimmed.match(/^([0-9]*\.?[0-9]+)\s*(B|KB|MB|GB)?$/i);
    if (m) {
      const num = parseFloat(m[1]);
      const u = (m[2] || unit || "B").toUpperCase();
      return num * (UNIT_MAP[u] || 1);
    }
    // fallback: try parseFloat
    const num = parseFloat(trimmed.replace(/[^0-9.]/g, ""));
    return isNaN(num) ? 0 : num;
  }

  return 0;
};

export const sortByName = (
  files: FileModel[],
  ascending = true
): FileModel[] => {
  return [...files].sort((a, b) => {
    const an = (a.name || "").toString();
    const bn = (b.name || "").toString();
    const cmp = an.localeCompare(bn, undefined, {
      numeric: true,
      sensitivity: "base",
    });
    return ascending ? cmp : -cmp;
  });
};

export const sortByModified = (
  files: FileModel[],
  ascending = true
): FileModel[] => {
  return [...files].sort((a, b) => {
    const at = parseModifiedToMillis(a.modifiedDate);
    const bt = parseModifiedToMillis(b.modifiedDate);
    const cmp = at - bt;
    return ascending ? cmp : -cmp;
  });
};

function parseModifiedToMillis(v?: string | null): number {
  if (!v) return 0;
  const trimmed = v.trim();

  // handle common keywords
  if (/^today$/i.test(trimmed)) return Date.now();
  if (/^yesterday$/i.test(trimmed)) return Date.now() - 24 * 60 * 60 * 1000;

  // handle patterns like "3 days ago"
  const agoMatch = trimmed.match(/^(\d+)\s+day[s]?\s+ago$/i);
  if (agoMatch) {
    const days = parseInt(agoMatch[1], 10);
    if (!isNaN(days)) return Date.now() - days * 24 * 60 * 60 * 1000;
  }

  // try parse using Date.parse
  const p = Date.parse(trimmed);
  if (!isNaN(p)) return p;

  // try common short formats like 'Jun 12, 2025'
  try {
    const d = new Date(trimmed);
    const t = d.getTime();
    if (!isNaN(t)) return t;
  } catch (e) {
    /* ignore */
  }

  return 0;
}

export const sortBySize = (
  files: FileModel[],
  ascending = true
): FileModel[] => {
  return [...files].sort((a, b) => {
    const aBytes = parseSizeToBytes(a.size, a.sizeUnit || null);
    const bBytes = parseSizeToBytes(b.size, b.sizeUnit || null);
    const cmp = aBytes - bBytes;
    return ascending ? cmp : -cmp;
  });
};

export default {
  parseSizeToBytes,
  sortByName,
  sortByModified,
  sortBySize,
};
