export function getDeliveryConfirmationWord(productName: string): string {
  const [firstWord] = productName.trim().split(/\s+/);
  return firstWord ?? "";
}
