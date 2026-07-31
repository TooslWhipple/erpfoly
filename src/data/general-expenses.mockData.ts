import type {
  ApportionmentType,
  CreateGeneralExpensePayload,
  GeneralExpenseBranchShare,
  GeneralExpenseCatalogOption,
  GeneralExpenseListItem,
  GeneralExpenseStatus,
  UnassignedInvoice,
} from "@/types/general-expenses.types";

export const EXPENSE_CATEGORIES: GeneralExpenseCatalogOption[] = [
  { id: "office", label: "Papelería y Art. de Oficina" },
  { id: "travel", label: "Viáticos" },
  { id: "utilities", label: "Servicios Públicos" },
  { id: "maintenance", label: "Mantenimiento" },
  { id: "rent", label: "Renta" },
  { id: "insurance", label: "Seguros" },
];

export const EXPENSE_SUPPLIERS: GeneralExpenseCatalogOption[] = [
  {
    id: "sup-1",
    label: "Papelería del Bajío",
    secondaryLabel: "PPB123456YT6",
  },
  {
    id: "sup-2",
    label: "Buró de crédito",
    secondaryLabel: "BDC998877AA1",
  },
  {
    id: "sup-3",
    label: "Refacciones Casa Muller",
    secondaryLabel: "RCM445566BB2",
  },
  {
    id: "sup-4",
    label: "Equipo de Oficina CopyMart",
    secondaryLabel: "EOC112233CC3",
  },
  {
    id: "sup-5",
    label: "MABE SA de CV",
    secondaryLabel: "MAB770011DD4",
  },
];

export const EXPENSE_RESPONSIBLES: GeneralExpenseCatalogOption[] = [
  { id: "user-1", label: "Julio Inzunza" },
  { id: "user-2", label: "José Carlos López" },
  { id: "user-3", label: "Ricardo Montes" },
  { id: "user-4", label: "Lizeth Montoya" },
];

export const APPORTIONMENT_TYPE_OPTIONS: Array<{
  value: ApportionmentType;
  label: string;
}> = [
  { value: "sales_participation", label: "Por participación de venta" },
  { value: "credit_card_sales", label: "Ventas de tarjeta de crédito" },
  { value: "cash_sales", label: "Ventas de contado" },
  { value: "free", label: "Libre" },
];

const DEFAULT_BRANCH_SHARES: Omit<GeneralExpenseBranchShare, "amount">[] = [
  { branchId: "b1", branchName: "Ejercito", percentage: 19, isForeign: false },
  { branchId: "b2", branchName: "Matriz", percentage: 16, isForeign: false },
  { branchId: "b3", branchName: "Centro", percentage: 14, isForeign: false },
  { branchId: "b4", branchName: "Aeropuerto", percentage: 12, isForeign: false },
  { branchId: "b5", branchName: "Altamira", percentage: 10, isForeign: true },
  { branchId: "b6", branchName: "Poza Rica", percentage: 7, isForeign: true },
  { branchId: "b7", branchName: "Av. Monterrey", percentage: 5, isForeign: false },
  { branchId: "b8", branchName: "San Luis Potosí", percentage: 5, isForeign: true },
  { branchId: "b9", branchName: "Panuco", percentage: 5, isForeign: true },
  { branchId: "b10", branchName: "Tampico", percentage: 7, isForeign: true },
];

export function buildBranchShares(
  amount: number,
  percentages?: Record<string, number>,
): GeneralExpenseBranchShare[] {
  return DEFAULT_BRANCH_SHARES.map((branch) => {
    const percentage = percentages?.[branch.branchId] ?? branch.percentage;
    return {
      ...branch,
      percentage,
      amount: Number(((amount * percentage) / 100).toFixed(2)),
    };
  });
}

function createExpense(
  partial: Omit<GeneralExpenseListItem, "balance" | "status"> & {
    status?: GeneralExpenseStatus;
  },
): GeneralExpenseListItem {
  const balance = Number((partial.amount - partial.paidAmount).toFixed(2));
  const status =
    partial.status ??
    (balance <= 0 ? "paid" : balance < partial.amount ? "pending" : "pending");

  return {
    ...partial,
    balance: Math.max(balance, 0),
    status,
  };
}

let expenseSeq = 20;

export function nextExpenseId(): string {
  expenseSeq += 1;
  return `ge-${expenseSeq}`;
}

export let mockGeneralExpenses: GeneralExpenseListItem[] = [
  createExpense({
    id: "ge-1",
    supplierId: "sup-1",
    supplierName: "Papelería del Bajío",
    supplierRfc: "PPB123456YT6",
    dueDate: "2026-04-30",
    amount: 40930,
    paidAmount: 20000,
    category: "Papelería y Art. de Oficina",
    description: "Compra de insumos de oficina para sucursales",
    assignToSupplier: true,
    isLocalPurchase: true,
    responsibleId: "user-1",
    responsibleName: "Julio Inzunza",
    requiresInvoice: true,
    invoices: [
      {
        id: "inv-linked-1",
        externalId: "91212DD3X56",
        date: "18/05/26",
        paymentType: "PUE",
        amount: 20000,
      },
    ],
    payments: [
      {
        id: "pay-1",
        date: "20/Abril/2026",
        registeredBy: "José Carlos López",
        amount: 15000,
      },
      {
        id: "pay-2",
        date: "06/Abril/2026",
        registeredBy: "José Carlos López",
        amount: 5000,
      },
    ],
    apportionEnabled: true,
    apportionmentType: "sales_participation",
    applyToForeignBranches: true,
    branchShares: buildBranchShares(40930),
    singleBranchId: null,
    singleBranchName: null,
    createdAt: "2026-04-01T10:00:00.000Z",
    status: "pending",
  }),
  createExpense({
    id: "ge-2",
    supplierId: "sup-2",
    supplierName: "Buró de crédito",
    supplierRfc: "BDC998877AA1",
    dueDate: "2026-03-30",
    amount: 12500,
    paidAmount: 12500,
    category: "Servicios Públicos",
    description: "Consulta de buró mensual",
    assignToSupplier: true,
    isLocalPurchase: false,
    responsibleId: "user-2",
    responsibleName: "José Carlos López",
    requiresInvoice: true,
    invoices: [],
    payments: [
      {
        id: "pay-3",
        date: "15/Marzo/2026",
        registeredBy: "José Carlos López",
        amount: 12500,
      },
    ],
    apportionEnabled: false,
    apportionmentType: "sales_participation",
    applyToForeignBranches: false,
    branchShares: [],
    singleBranchId: "b1",
    singleBranchName: "Ejercito",
    createdAt: "2026-03-01T10:00:00.000Z",
    status: "paid",
  }),
  createExpense({
    id: "ge-3",
    supplierId: "sup-1",
    supplierName: "Papelería del Bajío",
    supplierRfc: "PPB123456YT6",
    dueDate: "2026-02-28",
    amount: 28900,
    paidAmount: 0,
    category: "Papelería y Art. de Oficina",
    description: "Pedido trimestral de papelería",
    assignToSupplier: true,
    isLocalPurchase: true,
    responsibleId: "user-1",
    responsibleName: "Julio Inzunza",
    requiresInvoice: true,
    invoices: [],
    payments: [],
    apportionEnabled: false,
    apportionmentType: "free",
    applyToForeignBranches: false,
    branchShares: [],
    singleBranchId: "b2",
    singleBranchName: "Matriz",
    createdAt: "2026-02-10T10:00:00.000Z",
    status: "overdue",
  }),
  createExpense({
    id: "ge-4",
    supplierId: "sup-5",
    supplierName: "MABE SA de CV",
    supplierRfc: "MAB770011DD4",
    dueDate: "2026-05-15",
    amount: 56900,
    paidAmount: 10000,
    category: "Mantenimiento",
    description: "Refacciones y mantenimiento de equipos",
    assignToSupplier: true,
    isLocalPurchase: false,
    responsibleId: "user-3",
    responsibleName: "Ricardo Montes",
    requiresInvoice: true,
    invoices: [],
    payments: [
      {
        id: "pay-4",
        date: "10/Mayo/2026",
        registeredBy: "Ricardo Montes",
        amount: 10000,
      },
    ],
    apportionEnabled: true,
    apportionmentType: "credit_card_sales",
    applyToForeignBranches: true,
    branchShares: buildBranchShares(56900),
    singleBranchId: null,
    singleBranchName: null,
    createdAt: "2026-05-01T10:00:00.000Z",
    status: "pending",
  }),
  createExpense({
    id: "ge-5",
    supplierId: null,
    supplierName: "Gasto interno",
    dueDate: "2026-05-20",
    amount: 8500,
    paidAmount: 0,
    category: "Viáticos",
    description: "Viáticos de capacitación regional",
    assignToSupplier: false,
    isLocalPurchase: true,
    responsibleId: "user-4",
    responsibleName: "Lizeth Montoya",
    requiresInvoice: false,
    invoices: [],
    payments: [],
    apportionEnabled: false,
    apportionmentType: "sales_participation",
    applyToForeignBranches: false,
    branchShares: [],
    singleBranchId: "b3",
    singleBranchName: "Centro",
    createdAt: "2026-05-05T10:00:00.000Z",
    status: "pending",
  }),
  createExpense({
    id: "ge-6",
    supplierId: "sup-1",
    supplierName: "Papelería del Bajío",
    supplierRfc: "PPB123456YT6",
    dueDate: "2026-01-30",
    amount: 15200,
    paidAmount: 15200,
    category: "Papelería y Art. de Oficina",
    description: "Reposición de toner e insumos",
    assignToSupplier: true,
    isLocalPurchase: true,
    responsibleId: "user-1",
    responsibleName: "Julio Inzunza",
    requiresInvoice: true,
    invoices: [],
    payments: [
      {
        id: "pay-5",
        date: "28/Enero/2026",
        registeredBy: "José Carlos López",
        amount: 15200,
      },
    ],
    apportionEnabled: false,
    apportionmentType: "cash_sales",
    applyToForeignBranches: false,
    branchShares: [],
    singleBranchId: "b1",
    singleBranchName: "Ejercito",
    createdAt: "2026-01-15T10:00:00.000Z",
    status: "paid",
  }),
  createExpense({
    id: "ge-7",
    supplierId: "sup-3",
    supplierName: "Refacciones Casa Muller",
    supplierRfc: "RCM445566BB2",
    dueDate: "2026-03-10",
    amount: 22450,
    paidAmount: 5000,
    category: "Mantenimiento",
    description: "Refacciones de vehículos de reparto",
    assignToSupplier: true,
    isLocalPurchase: false,
    responsibleId: "user-2",
    responsibleName: "José Carlos López",
    requiresInvoice: true,
    invoices: [],
    payments: [
      {
        id: "pay-6",
        date: "01/Marzo/2026",
        registeredBy: "José Carlos López",
        amount: 5000,
      },
    ],
    apportionEnabled: true,
    apportionmentType: "sales_participation",
    applyToForeignBranches: false,
    branchShares: buildBranchShares(22450).filter((b) => !b.isForeign),
    singleBranchId: null,
    singleBranchName: null,
    createdAt: "2026-02-20T10:00:00.000Z",
    status: "overdue",
  }),
  createExpense({
    id: "ge-8",
    supplierId: "sup-4",
    supplierName: "Equipo de Oficina CopyMart",
    supplierRfc: "EOC112233CC3",
    dueDate: "2026-06-01",
    amount: 78000,
    paidAmount: 30000,
    category: "Papelería y Art. de Oficina",
    description: "Impresoras y multifuncionales",
    assignToSupplier: true,
    isLocalPurchase: false,
    responsibleId: "user-3",
    responsibleName: "Ricardo Montes",
    requiresInvoice: true,
    invoices: [],
    payments: [
      {
        id: "pay-7",
        date: "12/Mayo/2026",
        registeredBy: "Ricardo Montes",
        amount: 30000,
      },
    ],
    apportionEnabled: true,
    apportionmentType: "free",
    applyToForeignBranches: true,
    branchShares: buildBranchShares(78000, {
      b1: 0,
      b2: 0,
      b3: 0,
      b4: 0,
      b5: 0,
      b6: 0,
      b7: 0,
      b8: 0,
      b9: 0,
      b10: 0,
    }),
    singleBranchId: null,
    singleBranchName: null,
    createdAt: "2026-05-10T10:00:00.000Z",
    status: "pending",
  }),
];

export let mockUnassignedInvoices: UnassignedInvoice[] = [
  {
    id: "ua-1",
    supplierName: "Papelería del Bajío",
    supplierRfc: "PPB123456YT6",
    date: "12/Mayo/26",
    paymentType: "PUE",
    amount: 56000,
  },
  {
    id: "ua-2",
    supplierName: "Refacciones Casa Muller",
    supplierRfc: "RCM445566BB2",
    date: "09/Mayo/26",
    paymentType: "PUE",
    amount: 56000,
  },
  {
    id: "ua-3",
    supplierName: "Equipo de Oficina CopyMart",
    supplierRfc: "EOC112233CC3",
    date: "09/Mayo/26",
    paymentType: "PUE",
    amount: 56000,
  },
  {
    id: "ua-4",
    supplierName: "Buró de crédito",
    supplierRfc: "BDC998877AA1",
    date: "05/Mayo/26",
    paymentType: "PPD",
    amount: 8900,
  },
];

export const MOCK_SUPPLIER_INVOICES: Record<
  string,
  Array<{
    id: string;
    externalId: string;
    date: string;
    paymentType: string;
    amount: number;
  }>
> = {
  "sup-1": [
    {
      id: "si-1",
      externalId: "91212DD3X56",
      date: "18/05/26",
      paymentType: "PUE",
      amount: 56000,
    },
    {
      id: "si-2",
      externalId: "81211EE4Y67",
      date: "12/05/26",
      paymentType: "PUE",
      amount: 34000,
    },
  ],
  "sup-3": [
    {
      id: "si-3",
      externalId: "AAB12FF5Z89",
      date: "09/05/26",
      paymentType: "PUE",
      amount: 22450,
    },
  ],
  "sup-4": [
    {
      id: "si-4",
      externalId: "CCD33GG6W12",
      date: "09/05/26",
      paymentType: "PPD",
      amount: 78000,
    },
  ],
};

export function createExpenseFromPayload(
  payload: CreateGeneralExpensePayload,
): GeneralExpenseListItem {
  const paidAmount = 0;
  const amount = payload.amount;
  const balance = amount;

  return {
    id: nextExpenseId(),
    supplierId: payload.supplierId,
    supplierName: payload.supplierName || "Sin proveedor",
    dueDate: payload.dueDate,
    amount,
    paidAmount,
    balance,
    status: "pending",
    category: payload.category,
    description: payload.description,
    assignToSupplier: payload.assignToSupplier,
    isLocalPurchase: payload.isLocalPurchase,
    responsibleId: payload.responsibleId,
    responsibleName: payload.responsibleName,
    requiresInvoice: payload.requiresInvoice,
    invoices: payload.invoices,
    payments: [],
    apportionEnabled: payload.apportionEnabled,
    apportionmentType: payload.apportionmentType,
    applyToForeignBranches: payload.applyToForeignBranches,
    branchShares: payload.apportionEnabled
      ? payload.branchShares
      : [],
    singleBranchId: payload.singleBranchId,
    singleBranchName: payload.singleBranchName,
    createdAt: new Date().toISOString(),
  };
}

export function replaceMockExpenses(next: GeneralExpenseListItem[]) {
  mockGeneralExpenses = next;
}

export function replaceMockUnassignedInvoices(next: UnassignedInvoice[]) {
  mockUnassignedInvoices = next;
}
