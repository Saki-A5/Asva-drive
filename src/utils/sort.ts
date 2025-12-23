export function parseSize(size: string) {
  const value = parseFloat(size);
  if (size.toUpperCase().includes('GB')) return value * 1024;
  if (size.toUpperCase().includes('MB')) return value;
  return 0;
}

export function parseDate(date: string) {
  if (date === 'Today') return new Date();
  if (date === 'Yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
  return new Date(date);
}
