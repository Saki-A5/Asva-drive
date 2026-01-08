export function parseSize(size: string | undefined | null) {
  // Handle empty, null, or the specific em-dash used in your mapping
  if (!size || size === '—' || size === '-') return -1;

  // Remove all whitespace and commas, convert to uppercase
  const cleanSize = size.replace(/\s+/g, '').replace(/,/g, '').toUpperCase();

  // Extract the numeric part (e.g., "0.5" from "0.5MB")
  const value = parseFloat(cleanSize);

  if (isNaN(value)) return -1;

  // Convert everything to a base unit (KB) for accurate comparison
  if (cleanSize.includes('GB')) return value * 1024 * 1024;
  if (cleanSize.includes('MB')) return value * 1024;
  if (cleanSize.includes('KB')) return value;

  return value;
}

export function parseDate(date: string | undefined | null) {
  if (!date || date === '—') return new Date(0); // Sort empty/invalid dates to bottom

  if (date === 'Today') return new Date();
  if (date === 'Yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  const parsed = new Date(date);
  // Check if date is valid, if not return epoch
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
}
