export interface StreetAddressParts {
  street?: string | null;
  externalNumber?: string | null;
  internalNumber?: string | null;
}

export function formatStreetAddressLine({
  street,
  externalNumber,
  internalNumber,
}: StreetAddressParts): string {
  return [
    street?.trim() ?? "",
    externalNumber?.trim() ?? "",
    internalNumber?.trim() ? `Int. ${internalNumber.trim()}` : "",
  ]
    .filter((value) => value.length > 0)
    .join(" ")
    .trim();
}
