export function isCreditClient(header: {
  creditApplicationId: number | null | undefined;
}): boolean {
  return header.creditApplicationId != null;
}
