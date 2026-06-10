/**
 * Resolves login identifier from the single input field.
 * 10 digits → cellphone (MX). Anything else → username (uppercase).
 */
export function parseLoginIdentifier(identifier: string): {
  username?: string;
  cellphone?: string;
} {
  const trimmed = identifier.trim();
  if (/^\d{10}$/.test(trimmed)) {
    return { cellphone: trimmed };
  }
  return { username: trimmed };
}
