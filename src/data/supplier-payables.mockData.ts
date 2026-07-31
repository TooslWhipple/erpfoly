import type {
  SchedulePaymentPayload,
  SupplierPayableDiscrepancy,
  SupplierPayableListItem,
  SupplierPayableStatement,
  SupplierPayableStatus,
} from "@/types/supplier-payables.types";

function deriveStatus(
  amount: number,
  paidAmount: number,
  dueDate: string,
  forced?: SupplierPayableStatus,
): SupplierPayableStatus {
  if (forced) return forced;
  if (paidAmount >= amount) return "paid";
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date("2026-04-15T00:00:00");
  if (due < today) return "overdue";
  return "pending";
}

function buildListItem(
  statement: SupplierPayableStatement,
): SupplierPayableListItem {
  return {
    id: statement.id,
    periodLabel: statement.periodLabel,
    supplierId: statement.supplierId,
    supplierName: statement.supplierName,
    dueDate: statement.dueDate,
    amount: statement.amount,
    paidAmount: statement.paidAmount,
    balance: statement.balance,
    status: statement.status,
    hasDiscrepancies: statement.movements.some((m) => m.requiresAttention),
  };
}

let mockStatements: SupplierPayableStatement[] = [
  {
    id: "stmt-mabe-mar-2026",
    periodLabel: "Marzo 2026",
    supplierId: "sup-mabe",
    supplierName: "MABE S.A. de C.V.",
    dueDate: "2026-03-30",
    dueDateLabel: "30 de Marzo, 2026",
    amount: 394440.44,
    paidAmount: 150000,
    balance: 244440.44,
    status: "pending",
    cargoSubtotal: 26252,
    ventaSubtotal: 420692.44,
    movements: [
      {
        id: "mov-1",
        date: "2026-01-21",
        concept: "Recepción de mercancía",
        linkId: "123456",
        venta: 195490.9,
      },
      {
        id: "mov-2",
        date: "2026-01-16",
        concept: "Recepción de mercancía",
        linkId: "123421",
        venta: 225201.54,
        requiresAttention: true,
      },
      {
        id: "mov-3",
        date: "2026-03-15",
        concept: "Cargo por mercancía dañada",
        cargo: 18932,
      },
      {
        id: "mov-4",
        date: "2026-03-02",
        concept: "Cargo por gasto de publicidad",
        cargo: 7320,
      },
    ],
    payments: [
      {
        id: "pay-1",
        date: "2026-04-06",
        registeredBy: "José Carlos López",
        status: "paid",
        amount: 150000,
      },
    ],
  },
  {
    id: "stmt-mabe-feb-2026",
    periodLabel: "Febrero 2026",
    supplierId: "sup-mabe",
    supplierName: "MABE S.A. de C.V.",
    dueDate: "2026-03-30",
    dueDateLabel: "30 de Marzo, 2026",
    amount: 394440.44,
    paidAmount: 394440.44,
    balance: 0,
    status: "paid",
    cargoSubtotal: 26252,
    ventaSubtotal: 420692.44,
    movements: [
      {
        id: "mov-5",
        date: "2025-08-21",
        concept: "Pedido",
        linkId: "123456",
        venta: 290123.14,
      },
      {
        id: "mov-6",
        date: "2025-08-15",
        concept: "Cargo por mercancía dañada",
        cargo: 18932,
      },
      {
        id: "mov-7",
        date: "2025-08-11",
        concept: "Pedido",
        linkId: "321929",
        venta: 130569.3,
      },
      {
        id: "mov-8",
        date: "2025-08-15",
        concept: "Cargo por gasto de publicidad",
        cargo: 7320,
      },
    ],
    payments: [
      {
        id: "pay-2",
        date: "2026-04-02",
        registeredBy: "José Carlos López",
        status: "paid",
        amount: 150000,
      },
      {
        id: "pay-3",
        date: "2026-04-08",
        registeredBy: "José Carlos López",
        status: "paid",
        amount: 120000,
      },
      {
        id: "pay-4",
        date: "2026-04-12",
        registeredBy: "José Carlos López",
        status: "paid",
        amount: 124440.44,
      },
    ],
  },
  {
    id: "stmt-mabe-may-2026",
    periodLabel: "Mayo 2026",
    supplierId: "sup-mabe",
    supplierName: "MABE S.A. de C.V.",
    dueDate: "2026-04-30",
    dueDateLabel: "30 de Abril, 2026",
    amount: 394440.44,
    paidAmount: 0,
    balance: 394440.44,
    status: "pending",
    cargoSubtotal: 26252,
    ventaSubtotal: 420692.44,
    movements: [
      {
        id: "mov-9",
        date: "2026-01-21",
        concept: "Recepción de mercancía",
        linkId: "123456",
        venta: 195490.9,
      },
      {
        id: "mov-10",
        date: "2026-01-16",
        concept: "Recepción de mercancía",
        linkId: "123421",
        venta: 225201.54,
        requiresAttention: true,
      },
      {
        id: "mov-11",
        date: "2026-03-15",
        concept: "Cargo por mercancía dañada",
        cargo: 18932,
      },
      {
        id: "mov-12",
        date: "2026-03-02",
        concept: "Cargo por gasto de publicidad",
        cargo: 7320,
      },
    ],
    payments: [],
  },
  {
    id: "stmt-whirlpool-mar-2026",
    periodLabel: "Marzo 2026",
    supplierId: "sup-whirlpool",
    supplierName: "Whirlpool",
    dueDate: "2026-04-30",
    dueDateLabel: "30 de Abril, 2026",
    amount: 125000,
    paidAmount: 0,
    balance: 125000,
    status: "pending",
    cargoSubtotal: 0,
    ventaSubtotal: 125000,
    movements: [
      {
        id: "mov-13",
        date: "2026-03-10",
        concept: "Recepción de mercancía",
        linkId: "880101",
        venta: 125000,
      },
    ],
    payments: [],
  },
  {
    id: "stmt-samsung-feb-2026",
    periodLabel: "Febrero 2026",
    supplierId: "sup-samsung",
    supplierName: "Samsung",
    dueDate: "2026-03-15",
    dueDateLabel: "15 de Marzo, 2026",
    amount: 56900,
    paidAmount: 0,
    balance: 56900,
    status: "overdue",
    cargoSubtotal: 0,
    ventaSubtotal: 56900,
    movements: [
      {
        id: "mov-14",
        date: "2026-02-05",
        concept: "Recepción de mercancía",
        linkId: "990201",
        venta: 56900,
      },
    ],
    payments: [],
  },
  {
    id: "stmt-lg-ene-2026",
    periodLabel: "Enero 2026",
    supplierId: "sup-lg",
    supplierName: "LG",
    dueDate: "2026-02-28",
    dueDateLabel: "28 de Febrero, 2026",
    amount: 88400,
    paidAmount: 88400,
    balance: 0,
    status: "paid",
    cargoSubtotal: 0,
    ventaSubtotal: 88400,
    movements: [
      {
        id: "mov-15",
        date: "2026-01-12",
        concept: "Recepción de mercancía",
        linkId: "770301",
        venta: 88400,
      },
    ],
    payments: [
      {
        id: "pay-5",
        date: "2026-02-20",
        registeredBy: "Ricardo Montes",
        status: "paid",
        amount: 88400,
      },
    ],
  },
  {
    id: "stmt-hisense-abr-2026",
    periodLabel: "Abril 2026",
    supplierId: "sup-hisense",
    supplierName: "Hisense",
    dueDate: "2026-05-15",
    dueDateLabel: "15 de Mayo, 2026",
    amount: 43200.5,
    paidAmount: 10000,
    balance: 33200.5,
    status: "pending",
    cargoSubtotal: 0,
    ventaSubtotal: 43200.5,
    movements: [
      {
        id: "mov-16",
        date: "2026-04-01",
        concept: "Recepción de mercancía",
        linkId: "660401",
        venta: 43200.5,
      },
    ],
    payments: [
      {
        id: "pay-6",
        date: "2026-04-10",
        registeredBy: "Lizeth Montoya",
        status: "paid",
        amount: 10000,
      },
    ],
  },
  {
    id: "stmt-koblenz-mar-2026",
    periodLabel: "Marzo 2026",
    supplierId: "sup-koblenz",
    supplierName: "Koblenz",
    dueDate: "2026-04-10",
    dueDateLabel: "10 de Abril, 2026",
    amount: 28944.45,
    paidAmount: 0,
    balance: 28944.45,
    status: "overdue",
    cargoSubtotal: 0,
    ventaSubtotal: 28944.45,
    movements: [
      {
        id: "mov-17",
        date: "2026-03-05",
        concept: "Recepción de mercancía",
        linkId: "550501",
        venta: 28944.45,
      },
    ],
    payments: [],
  },
];

// Recalculate statuses from balances/due dates for consistency
mockStatements = mockStatements.map((statement) => {
  const status = deriveStatus(
    statement.amount,
    statement.paidAmount,
    statement.dueDate,
    statement.status === "paid" || statement.status === "overdue"
      ? statement.status
      : undefined,
  );
  return { ...statement, status, balance: Number((statement.amount - statement.paidAmount).toFixed(2)) };
});

export function getMockStatements(): SupplierPayableStatement[] {
  return mockStatements.map((statement) => ({
    ...statement,
    movements: statement.movements.map((m) => ({ ...m })),
    payments: statement.payments.map((p) => ({ ...p })),
  }));
}

export function getMockListItems(): SupplierPayableListItem[] {
  return mockStatements.map(buildListItem);
}

export function findMockStatement(
  id: string,
): SupplierPayableStatement | undefined {
  const found = mockStatements.find((statement) => statement.id === id);
  if (!found) return undefined;
  return {
    ...found,
    movements: found.movements.map((m) => ({ ...m })),
    payments: found.payments.map((p) => ({ ...p })),
  };
}

export function getMockDiscrepancies(): SupplierPayableDiscrepancy[] {
  const rows: SupplierPayableDiscrepancy[] = [];
  for (const statement of mockStatements) {
    for (const movement of statement.movements) {
      if (!movement.requiresAttention) continue;
      rows.push({
        id: `disc-${movement.id}`,
        statementId: statement.id,
        periodLabel: statement.periodLabel,
        supplierName: statement.supplierName,
        movementId: movement.id,
        movementConcept: movement.concept,
        movementDate: movement.date,
        amount: movement.venta ?? movement.cargo ?? 0,
      });
    }
  }
  return rows;
}

export function applyScheduledPayment(
  statementId: string,
  payload: SchedulePaymentPayload,
): SupplierPayableStatement | null {
  const index = mockStatements.findIndex((s) => s.id === statementId);
  if (index < 0) return null;

  const current = mockStatements[index];
  if (current.movements.some((m) => m.requiresAttention)) {
    return null;
  }

  const nextPaid = Number((current.paidAmount + payload.amount).toFixed(2));
  const nextBalance = Number((current.amount - nextPaid).toFixed(2));
  const status = deriveStatus(current.amount, nextPaid, current.dueDate);

  const updated: SupplierPayableStatement = {
    ...current,
    paidAmount: nextPaid,
    balance: Math.max(0, nextBalance),
    status,
    payments: [
      ...current.payments,
      {
        id: `pay-${Date.now()}`,
        date: payload.scheduledDate,
        registeredBy: "José Carlos López",
        status: "paid",
        amount: payload.amount,
      },
    ],
  };

  mockStatements = [
    ...mockStatements.slice(0, index),
    updated,
    ...mockStatements.slice(index + 1),
  ];

  return findMockStatement(statementId) ?? null;
}
