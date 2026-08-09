import type {
  MerchandiseReceptionAvailableInvoice,
  MerchandiseReceptionBillingSummary,
  MerchandiseReceptionDiscrepancyDetail,
  MerchandiseReceptionDiscrepancyListItem,
  MerchandiseReceptionInvoice,
} from "@/types/merchandise-reception-discrepancies.types";

function computeBillingSummary(
  invoices: MerchandiseReceptionInvoice[],
  totalArticles: number,
): MerchandiseReceptionBillingSummary {
  let totalInvoiced = 0;
  let totalCreditNotes = 0;

  for (const invoice of invoices) {
    if (invoice.type === "CREDIT_NOTE") {
      totalCreditNotes += invoice.amount;
    } else {
      totalInvoiced += invoice.amount;
    }
  }

  const netInvoiced = totalInvoiced + totalCreditNotes;
  const discrepancy = Math.round((netInvoiced - totalArticles) * 100) / 100;

  return {
    totalInvoiced,
    totalCreditNotes,
    totalArticles,
    discrepancy,
  };
}

function toListItem(
  detail: MerchandiseReceptionDiscrepancyDetail,
): MerchandiseReceptionDiscrepancyListItem {
  return {
    id: detail.id,
    receptionId: detail.receptionId,
    supplierId: detail.supplierId,
    supplierName: detail.supplierName,
    receptionDate: detail.receptionDate,
    itemsTotal: detail.billingSummary.totalArticles,
    invoicedTotal: detail.billingSummary.totalInvoiced,
    discrepancy: detail.billingSummary.discrepancy,
    status: detail.status,
  };
}

let mockDetails: MerchandiseReceptionDiscrepancyDetail[] = [
  {
    id: "disc-mabe-2026-04-15",
    receptionId: "239392",
    supplierId: "sup-mabe",
    supplierName: "MABE S.A. de C.V.",
    originName: "Mirage -Norage S.A. de C.V.-",
    originDate: "2025-06-01",
    branchName: "Bodega Sucursal Matriz",
    deliveryDate: "2025-06-08",
    receptionDate: "2026-04-15",
    status: "pending",
    invoices: [
      {
        id: "inv-1",
        externalId: "91212DD3X44",
        date: "18/05/26",
        type: "PUE",
        amount: 197560,
      },
      {
        id: "inv-2",
        externalId: "91212DD3X44",
        date: "18/05/26",
        type: "PUE",
        amount: 56000,
      },
    ],
    availableInvoices: [
      {
        id: "avail-1",
        externalId: "91212DD3X44",
        date: "18/05/26",
        type: "CREDIT_NOTE",
        amount: -19620,
      },
      {
        id: "avail-2",
        externalId: "91212DD3X55",
        date: "18/05/26",
        type: "PUE",
        amount: 56000,
      },
      {
        id: "avail-3",
        externalId: "91212DD3X66",
        date: "19/05/26",
        type: "PUE",
        amount: 34000,
      },
    ],
    billingSummary: {
      totalInvoiced: 253560,
      totalCreditNotes: 0,
      totalArticles: 233940,
      discrepancy: 19620,
    },
  },
  {
    id: "disc-whirlpool-2026-04-12",
    receptionId: "239310",
    supplierId: "sup-whirlpool",
    supplierName: "Whirlpool S.A. de C.V.",
    originName: "Whirlpool S.A. de C.V.",
    originDate: "2026-04-01",
    branchName: "Bodega Sucursal Matriz",
    deliveryDate: "2026-04-10",
    receptionDate: "2026-04-12",
    status: "paid",
    invoices: [
      {
        id: "inv-w1",
        externalId: "WRL-88991AA",
        date: "10/04/26",
        type: "PUE",
        amount: 712510.3,
      },
    ],
    availableInvoices: [
      {
        id: "avail-w1",
        externalId: "WRL-88991BB",
        date: "11/04/26",
        type: "CREDIT_NOTE",
        amount: -20187.73,
      },
    ],
    billingSummary: {
      totalInvoiced: 712510.3,
      totalCreditNotes: 0,
      totalArticles: 692323,
      discrepancy: 20187.73,
    },
  },
  {
    id: "disc-mabe-2026-02-15",
    receptionId: "238901",
    supplierId: "sup-mabe",
    supplierName: "MABE S.A. de C.V.",
    originName: "MABE S.A. de C.V.",
    originDate: "2026-02-01",
    branchName: "Bodega Sucursal Norte",
    deliveryDate: "2026-02-12",
    receptionDate: "2026-02-15",
    status: "paid",
    invoices: [
      {
        id: "inv-m3",
        externalId: "MABE-22110",
        date: "12/02/26",
        type: "PUE",
        amount: 1310300,
      },
    ],
    availableInvoices: [],
    billingSummary: {
      totalInvoiced: 1310300,
      totalCreditNotes: 0,
      totalArticles: 1310300,
      discrepancy: 0,
    },
  },
  {
    id: "disc-mibea-2026-02-15",
    receptionId: "238880",
    supplierId: "sup-mibea",
    supplierName: "Mibea S.A. de C.V.",
    originName: "Mibea S.A. de C.V.",
    originDate: "2026-02-03",
    branchName: "Bodega Sucursal Matriz",
    deliveryDate: "2026-02-14",
    receptionDate: "2026-02-15",
    status: "paid",
    invoices: [
      {
        id: "inv-mi1",
        externalId: "MIB-44021",
        date: "14/02/26",
        type: "PUE",
        amount: 430149,
      },
      {
        id: "inv-mi2",
        externalId: "MIB-44022",
        date: "14/02/26",
        type: "CREDIT_NOTE",
        amount: -19620,
      },
    ],
    availableInvoices: [
      {
        id: "avail-mi1",
        externalId: "MIB-44023",
        date: "15/02/26",
        type: "PUE",
        amount: 12000,
      },
    ],
    billingSummary: {
      totalInvoiced: 430149,
      totalCreditNotes: -19620,
      totalArticles: 410529,
      discrepancy: 0,
    },
  },
];

export function getMockMerchandiseReceptionDiscrepancies(): MerchandiseReceptionDiscrepancyListItem[] {
  return mockDetails.map(toListItem);
}

export function findMockDiscrepancyDetail(
  id: string,
): MerchandiseReceptionDiscrepancyDetail | null {
  const detail = mockDetails.find((item) => item.id === id);
  if (!detail) return null;
  return {
    ...detail,
    invoices: detail.invoices.map((invoice) => ({ ...invoice })),
    availableInvoices: detail.availableInvoices.map((invoice) => ({
      ...invoice,
    })),
    billingSummary: { ...detail.billingSummary },
  };
}

export function addMockInvoicesToDiscrepancy(
  id: string,
  invoiceIds: string[],
): MerchandiseReceptionDiscrepancyDetail | null {
  const index = mockDetails.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const current = mockDetails[index];
  const selected = current.availableInvoices.filter((invoice) =>
    invoiceIds.includes(invoice.id),
  );
  if (selected.length === 0) return findMockDiscrepancyDetail(id);

  const remainingAvailable = current.availableInvoices.filter(
    (invoice) => !invoiceIds.includes(invoice.id),
  );
  const linkedInvoices: MerchandiseReceptionInvoice[] = [
    ...current.invoices,
    ...selected.map((invoice: MerchandiseReceptionAvailableInvoice) => ({
      id: invoice.id,
      externalId: invoice.externalId,
      date: invoice.date,
      type: invoice.type,
      amount: invoice.amount,
    })),
  ];

  const billingSummary = computeBillingSummary(
    linkedInvoices,
    current.billingSummary.totalArticles,
  );

  mockDetails = mockDetails.map((item, itemIndex) =>
    itemIndex === index
      ? {
          ...item,
          invoices: linkedInvoices,
          availableInvoices: remainingAvailable,
          billingSummary,
        }
      : item,
  );

  return findMockDiscrepancyDetail(id);
}
