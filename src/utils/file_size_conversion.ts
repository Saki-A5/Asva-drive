export function bytesToMegabytes(bytes:number, decimals = 2) {
  return parseFloat((bytes / (1024 * 1024)).toFixed(decimals));
}