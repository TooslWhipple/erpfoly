import type {
  ClientCreditAccount,
  ClientPaymentContext,
  ClientPaymentResult,
  CreateClientPaymentPayload,
  InstallmentSelection,
  PaymentAllocation,
  PendingInstallment,
} from "@/types/clientPayment.types";

function buildPendingInstallments(
  startInstallment: number,
  totalInstallments: number,
  basePrincipal: number,
  interestByInstallment: Record<number, number>,
  dueDates: string[],
): PendingInstallment[] {
  return Array.from({ length: 3 }, (_, index) => {
    const installmentNumber = startInstallment + index;
    const interestAmount = interestByInstallment[installmentNumber] ?? 0;

    return {
      id: String(installmentNumber),
      installmentNumber,
      totalInstallments,
      dueDate: dueDates[index] ?? "30 de Jun",
      principalAmount: basePrincipal,
      interestAmount,
      totalAmount: basePrincipal + interestAmount,
    };
  });
}

const MOCK_CREDIT_ACCOUNTS: ClientCreditAccount[] = [
  {
    id: "1",
    productName: "Enfriador Split Mirage CHF120T 1Ton 110v F/F",
    purchaseDateLabel: "16 de Mayo, 2025",
    initialCost: 9490,
    totalPaid: 2372.49,
    remaining: 7117.51,
    paymentDueDate: "16 de Sep",
    highlightPaymentDueDate: true,
    nextPaymentAmount: 840.83,
    nextPaymentBreakdown: "($790.83 + $50.00 Int)",
    paidInstallments: 3,
    totalInstallments: 12,
    pendingInstallments: buildPendingInstallments(
      4,
      12,
      790.83,
      { 4: 50, 5: 0, 6: 0 },
      ["16 de Oct", "16 de Nov", "16 de Dic"],
    ),
  },
  {
    id: "2",
    productName: "Lavadora Whirlpool 22Kg 8MWTW2224WJM",
    purchaseDateLabel: "22 de Nov, 2024",
    initialCost: 14399,
    totalPaid: 10799.19,
    remaining: 3599.81,
    paymentDueDate: "22 de Sep",
    highlightPaymentDueDate: false,
    nextPaymentAmount: 1199.91,
    paidInstallments: 9,
    totalInstallments: 12,
    pendingInstallments: buildPendingInstallments(
      10,
      12,
      1199.91,
      { 10: 0, 11: 0, 12: 0 },
      ["22 de Oct", "22 de Nov", "22 de Dic"],
    ),
  },
];

const CLIENT_NAMES: Record<string, { fullName: string; phone: string }> = {
  "1": { fullName: "Jose Antonio Montes Molina", phone: "55 667 10 51200" },
  "2": { fullName: "María García López", phone: "55 1234 5678" },
  "3": { fullName: "Carlos Hernández Ruiz", phone: "55 9876 5432" },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getClientPaymentContext(
  clientId: string,
): Promise<ClientPaymentContext | null> {
  await delay(400);

  const client = CLIENT_NAMES[clientId] ?? {
    fullName: "Cliente demo",
    phone: "55 0000 0000",
  };

  return {
    clientId,
    clientName: client.fullName,
    clientPhone: client.phone,
    creditAccounts: MOCK_CREDIT_ACCOUNTS,
  };
}

export async function searchClientForPayment(
  query: string,
): Promise<{ id: string; fullName: string; clientCode: string } | null> {
  await delay(300);

  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  const match = Object.entries(CLIENT_NAMES).find(([, client]) =>
    client.fullName.toLowerCase().includes(normalized),
  );

  if (match) {
    return {
      id: match[0],
      fullName: match[1].fullName,
      clientCode: "MOMJ113003TY5",
    };
  }

  if (normalized.includes("momj") || normalized.includes("jose")) {
    return {
      id: "1",
      fullName: CLIENT_NAMES["1"].fullName,
      clientCode: "MOMJ113003TY5",
    };
  }

  return null;
}

function distributePayment(
  creditAccounts: ClientCreditAccount[],
  selections: InstallmentSelection[],
  paymentAmount: number,
): PaymentAllocation[] {
  const allocations: PaymentAllocation[] = [];
  let remaining = paymentAmount;

  const selectedRows = selections
    .filter((selection) => selection.amountToPay > 0)
    .sort((a, b) => {
      const accountA = creditAccounts.find((account) => account.id === a.purchaseId);
      const accountB = creditAccounts.find((account) => account.id === b.purchaseId);
      const installmentA = accountA?.pendingInstallments.find((item) => item.id === a.installmentId);
      const installmentB = accountB?.pendingInstallments.find((item) => item.id === b.installmentId);
      return (installmentA?.installmentNumber ?? 0) - (installmentB?.installmentNumber ?? 0);
    });

  for (const selection of selectedRows) {
    if (remaining <= 0) break;

    const account = creditAccounts.find((item) => item.id === selection.purchaseId);
    const installment = account?.pendingInstallments.find((item) => item.id === selection.installmentId);
    if (!account || !installment) continue;

    const applied = Math.min(remaining, selection.amountToPay);
    if (applied <= 0) continue;

    const isFullPayment = applied >= installment.totalAmount - 0.001;
    const label = isFullPayment
      ? `Pago de parcialidad ${installment.installmentNumber} de ${installment.totalInstallments}`
      : `Abono de parcialidad ${installment.installmentNumber} de ${installment.totalInstallments}`;

    allocations.push({ label, amount: applied });
    remaining -= applied;
  }

  if (remaining > 0) {
    const primaryAccount = creditAccounts[0];
    const nextInstallment = primaryAccount?.pendingInstallments.find(
      (item) => !selectedRows.some(
        (selection) => selection.purchaseId === primaryAccount.id && selection.installmentId === item.id,
      ),
    ) ?? primaryAccount?.pendingInstallments[selectedRows.length];

    if (nextInstallment) {
      allocations.push({
        label: `Abono de parcialidad ${nextInstallment.installmentNumber} de ${nextInstallment.totalInstallments}`,
        amount: remaining,
      });
      remaining = 0;
    }
  }

  return allocations;
}

export async function createClientPayment(
  payload: CreateClientPaymentPayload,
  creditAccounts: ClientCreditAccount[],
): Promise<ClientPaymentResult> {
  await delay(800);

  const primaryAccount = creditAccounts[0];
  const allocations = distributePayment(creditAccounts, payload.selections, payload.paymentAmount);

  return {
    id: `PAY-${Date.now()}`,
    totalAmount: payload.paymentAmount,
    dateLabel: "10 de Nov, 2025",
    allocations: allocations.length > 0
      ? allocations
      : [{ label: "Abono a cuenta", amount: payload.paymentAmount }],
    clientPhone: CLIENT_NAMES[payload.clientId]?.phone ?? "55 0000 0000",
    paidInstallments: primaryAccount?.paidInstallments ?? 0,
    totalInstallments: primaryAccount?.totalInstallments ?? 12,
    receiptUrl: "/api/receipts/demo.pdf",
  };
}
