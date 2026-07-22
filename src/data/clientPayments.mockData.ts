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
  installmentAmount: number,
  dueDates: string[],
): PendingInstallment[] {
  return Array.from({ length: 3 }, (_, index) => {
    const installmentNumber = startInstallment + index;

    return {
      id: String(installmentNumber),
      installmentNumber,
      totalInstallments,
      dueDate: dueDates[index] ?? "30 de Jun",
      overdueAmount: 0,
      totalAmount: installmentAmount,
    };
  });
}

const MOCK_CREDIT_ACCOUNTS: ClientCreditAccount[] = [
  {
    id: "1",
    productName: "Enfriador Split Mirage CHF120T 1Ton 110v F/F",
    purchaseDate: "2025-05-16",
    purchaseDateLabel: "16 de Mayo, 2025",
    initialCost: 9490,
    totalPaid: 2372.49,
    remaining: 7117.51,
    paymentDueDate: "16 de Sep",
    highlightPaymentDueDate: true,
    nextPaymentAmount: 790.83,
    nextPaymentOverdue: 0,
    paidInstallments: 3,
    totalInstallments: 12,
    pendingInstallments: buildPendingInstallments(
      4,
      12,
      790.83,
      ["16 de Oct", "16 de Nov", "16 de Dic"],
    ),
  },
  {
    id: "2",
    productName: "Lavadora Whirlpool 22Kg 8MWTW2224WJM",
    purchaseDate: "2024-11-22",
    purchaseDateLabel: "22 de Nov, 2024",
    initialCost: 14399,
    totalPaid: 10799.19,
    remaining: 3599.81,
    paymentDueDate: "22 de Sep",
    highlightPaymentDueDate: false,
    nextPaymentAmount: 1199.91,
    nextPaymentOverdue: 0,
    paidInstallments: 9,
    totalInstallments: 12,
    pendingInstallments: buildPendingInstallments(
      10,
      12,
      1199.91,
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

export interface ClientSearchResultMock {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  paymentStatus: "overdue" | "current";
  address: string;
  searchTerms: string[];
}

type ClientSearchResultItem = Omit<ClientSearchResultMock, "searchTerms">;

const MOCK_CLIENT_SEARCH_CATALOG: ClientSearchResultMock[] = [
  {
    id: 5001,
    fullName: "Jose Antonio Montes Molina",
    phone: "667 123 4567",
    email: "jose.montes@gmail.com",
    paymentStatus: "overdue",
    address: "Circuito Universitario 2322. Colonia Universitaria. Culiacán, Sinaloa. Mexico",
    searchTerms: ["jose", "antonio", "montes", "momj", "5001"],
  },
  {
    id: 138,
    fullName: "Jose Antonio Garcia Espino",
    phone: "667 123 4567",
    email: "jose.montes@gmail.com",
    paymentStatus: "current",
    address: "Av. Alvaro Obregon 1450. Colonia Centro. Culiacán, Sinaloa. Mexico",
    searchTerms: ["jose", "antonio", "garcia", "0138", "138"],
  },
  {
    id: 2241,
    fullName: "Jose Antonio Del Castillo",
    phone: "667 123 4567",
    email: "jose.montes@gmail.com",
    paymentStatus: "overdue",
    address: "Blvd. Pedro Infante 890. Colonia Guadalupe. Culiacán, Sinaloa. Mexico",
    searchTerms: ["jose", "antonio", "castillo", "2241"],
  },
  {
    id: 5522,
    fullName: "Jose Antonio Ramirez Vega",
    phone: "667 123 4567",
    email: "jose.montes@gmail.com",
    paymentStatus: "current",
    address: "Calle Rio Fuerte 456. Colonia Jardines. Culiacán, Sinaloa. Mexico",
    searchTerms: ["jose", "antonio", "ramirez", "5522"],
  },
  {
    id: 2,
    fullName: "María García López",
    phone: "55 1234 5678",
    email: "maria.garcia@gmail.com",
    paymentStatus: "current",
    address: "Calle Reforma 120. Colonia Centro. Ciudad de México. Mexico",
    searchTerms: ["maria", "garcia", "lopez", "2"],
  },
  {
    id: 3,
    fullName: "Carlos Hernández Ruiz",
    phone: "55 9876 5432",
    email: "carlos.hernandez@gmail.com",
    paymentStatus: "overdue",
    address: "Av. Insurgentes 340. Colonia Roma. Ciudad de México. Mexico",
    searchTerms: ["carlos", "hernandez", "ruiz", "3"],
  },
];

function matchesClientSearch(client: ClientSearchResultMock, normalizedQuery: string): boolean {
  const compactId = String(client.id);
  const paddedId = compactId.padStart(4, "0");

  return (
    client.fullName.toLowerCase().includes(normalizedQuery)
    || client.searchTerms.some((term) => term.includes(normalizedQuery) || normalizedQuery.includes(term))
    || compactId.includes(normalizedQuery)
    || paddedId.includes(normalizedQuery)
  );
}

export async function searchClientsForPayment(
  query: string,
): Promise<ClientSearchResultItem[]> {
  await delay(300);

  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return MOCK_CLIENT_SEARCH_CATALOG
    .filter((client) => matchesClientSearch(client, normalized))
    .map(({ searchTerms: _searchTerms, ...client }) => client);
}

export async function searchClientForPayment(
  query: string,
): Promise<{ id: string; fullName: string; clientCode: string } | null> {
  const results = await searchClientsForPayment(query);
  if (results.length === 0) return null;

  const client = results[0];
  return {
    id: String(client.id),
    fullName: client.fullName,
    clientCode: "MOMJ113003TY5",
  };
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
    creditsAffectedCount: 1,
    receiptUrl: "/api/receipts/demo.pdf",
  };
}
