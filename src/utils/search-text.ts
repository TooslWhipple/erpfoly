export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesNormalizedSearch(
  query: string,
  ...fields: Array<string | null | undefined>
): boolean {
  if (!query) return true;
  return fields.some((field) => {
    const normalizedField = normalizeSearchText(field ?? "");
    return normalizedField.length > 0 && normalizedField.includes(query);
  });
}
