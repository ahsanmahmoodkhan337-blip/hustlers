/**
 * Normalize a phone number for consistent storage and lookup.
 *
 * Steps:
 * 1. Strip all non-digit characters (spaces, dashes, +, etc.)
 * 2. Normalize Pakistan numbers:
 *    - If starts with "0" (e.g. "0305..."), convert to "92305..." (drop leading 0, prepend "92")
 *    - If starts with "92" (e.g. "92305..."), keep as-is
 *    - If starts with "+92", strip the "+" and keep "92..."
 * 3. Otherwise, return the digits as-is (for international numbers)
 */
export function normalizePhone(raw: string): string {
  // Step 1: Strip all non-digit characters
  const digits = raw.replace(/\D/g, '')

  if (!digits) return ''

  // Step 2: Normalize Pakistan numbers
  // "+92305..." → "92305..."
  if (digits.startsWith('92') && digits.length >= 10) {
    return digits
  }

  // "0305..." → "92305..."
  if (digits.startsWith('0') && digits.length >= 10) {
    return '92' + digits.slice(1)
  }

  // "0092..." → "92..." (some international formats)
  if (digits.startsWith('0092') && digits.length >= 12) {
    return digits.slice(2)
  }

  // Return digits as-is for non-Pakistan or already-normalized numbers
  return digits
}