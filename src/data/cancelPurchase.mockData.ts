import type { CancelPurchaseReason } from "@/types/cancelPurchase.types";

export const CANCEL_PURCHASE_REASONS: CancelPurchaseReason[] = [
  {
    id: "REASON_1",
    title: "Motivo 1",
    description:
      "Descripción de motivo. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "REASON_2",
    title: "Motivo 2",
    description:
      "Descripción de motivo. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "REASON_3",
    title: "Motivo 3",
    description:
      "Descripción de motivo. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    id: "OTHER",
    title: "Otro motivo",
    description: "",
    allowsCustomText: true,
  },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function cancelClientPurchase(_purchaseId: string): Promise<void> {
  await delay(600);
}
