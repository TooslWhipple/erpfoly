/**
 * Converts a string to Title Case using Spanish locale rules.
 * "juan pérez lópez" → "Juan Pérez López"
 */
export function toTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  return trimmed
    .split(/\s+/)
    .map((word) => {
      if (!word) {
        return word;
      }
      const first = word.charAt(0).toLocaleUpperCase("es-MX");
      const rest = word.slice(1).toLocaleLowerCase("es-MX");
      return `${first}${rest}`;
    })
    .join(" ");
}
