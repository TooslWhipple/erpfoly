import type { ClientPurchaseDetail, ClientPurchasePayment } from "@/types/clientPurchase.types";

const BASE_PAYMENTS: ClientPurchasePayment[] = Array.from({ length: 12 }, (_, index) => {
  const installmentNumber = 12 - index;
  const isPaid = installmentNumber <= 3;

  return {
    id: String(installmentNumber),
    status: isPaid ? "PAID" : "PENDING",
    installmentLabel: `Abono ${installmentNumber} de 12`,
    dueDate: "30 de Jun",
    amount: installmentNumber === 12 ? 590 : 840.83,
  };
});

const BASE_PURCHASE: Omit<ClientPurchaseDetail, "id" | "status" | "paidInstallments" | "totalPaid" | "remaining" | "payments" | "purchaseInfo" | "highlightPaymentDueDate"> = {
  reference: "MOMJ113003TY5",
  productSku: "04ET-123456",
  productImageUrl: null,
  clientId: "1",
  clientName: "Jose Antonio Montes Molina",
  productName: "Enfriador Split Mirage CHF120T 1Ton 110v F/F",
  purchaseDateLabel: "16 de Mayo, 2025",
  initialCost: 9490,
  paymentDueDate: "16 de Sep",
  nextPaymentAmount: 840.83,
  totalInstallments: 12,
};

const PURCHASE_INFO = {
  purchaseDate: "15 / Enero / 2026",
  deliveryDate: "18 / Enero / 2026",
  purchaseBranch: "Matamoros-Pedro Cárdenas",
  deliveryBranch: "Matamoros-Plaza Patio",
};

const MOCK_PURCHASES: Record<string, ClientPurchaseDetail> = {
  "1": {
    ...BASE_PURCHASE,
    id: "1",
    status: "AL_CORRIENTE",
    totalPaid: 2372.49,
    remaining: 7117.51,
    paidInstallments: 3,
    highlightPaymentDueDate: true,
    payments: BASE_PAYMENTS,
    purchaseInfo: PURCHASE_INFO,
  },
  "2": {
    ...BASE_PURCHASE,
    id: "2",
    status: "ENTREGA_PROGRAMADA",
    totalPaid: 0,
    remaining: 9490,
    paidInstallments: 0,
    highlightPaymentDueDate: false,
    paymentDueDate: "20 de Junio",
    payments: BASE_PAYMENTS.map((payment) => ({ ...payment, status: "PENDING" })),
    purchaseInfo: PURCHASE_INFO,
  },
  "3": {
    ...BASE_PURCHASE,
    id: "3",
    status: "ENTREGA_PENDIENTE",
    totalPaid: 0,
    remaining: 9490,
    paidInstallments: 0,
    highlightPaymentDueDate: false,
    paymentDueDate: "20 Feb, 26",
    payments: BASE_PAYMENTS.map((payment) => ({ ...payment, status: "PENDING" })),
    purchaseInfo: PURCHASE_INFO,
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getClientPurchaseDetail(
  clientId: string,
  purchaseId: string,
): Promise<ClientPurchaseDetail | null> {
  await delay(400);

  const purchase = MOCK_PURCHASES[purchaseId];
  if (!purchase) return null;

  return {
    ...purchase,
    clientId,
  };
}
