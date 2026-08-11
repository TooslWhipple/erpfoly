import type {
  ReceiveRecoveryItemPayload,
  RecoverySheetDetail,
  RecoverySheetListItem,
  RecoverySheetOrigin,
  RecoverySheetStatus,
} from "@/types/recovery-sheets.types";

const SEED_RECOVERY_SHEET_ID = "12345XX9PLL12";

const seedListItems: RecoverySheetListItem[] = [
  {
    id: SEED_RECOVERY_SHEET_ID,
    folio: "12345XX9PLL12",
    origin: "atencion_cliente",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    createdAt: "2026-04-30",
    status: "pendiente",
  },
  {
    id: "12345XX9PLL13",
    folio: "12345XX9PLL13",
    origin: "cajas",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    createdAt: "2026-04-30",
    status: "pendiente",
  },
  {
    id: "12345XX9PLL14",
    folio: "12345XX9PLL14",
    origin: "atencion_cliente",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    createdAt: "2026-04-30",
    status: "programada",
  },
  {
    id: "12345XX9PLL15",
    folio: "12345XX9PLL15",
    origin: "cajas",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    createdAt: "2026-04-30",
    status: "recuperada",
  },
  {
    id: "12345XX9PLL16",
    folio: "12345XX9PLL16",
    origin: "atencion_cliente",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    createdAt: "2026-04-30",
    status: "pendiente",
  },
];

const seedDetails: Record<string, RecoverySheetDetail> = {
  [SEED_RECOVERY_SHEET_ID]: {
    id: SEED_RECOVERY_SHEET_ID,
    folio: "12345XX9PLL12",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    origin: "atencion_cliente",
    invoiceId: "1249941",
    invoiceNumber: "193270",
    createdAt: "2026-04-30",
    status: "pendiente",
    scheduledRoute: {
      id: "582813",
      routeId: "582813",
      status: "pendiente",
      branchName: "Altamira Centro",
      recoveryDate: "2026-05-15",
    },
    serviceOrder: {
      id: "1234567",
      serviceOrderId: "OS-1249941-1",
      status: "por_realizar",
      title: "Sofá hundido",
      generatedAt: "2026-05-03",
      comment:
        "El cliente comenta que se ha hundido una parte del asiento del sofa a los pocos días de comprarlo",
    },
  },
  "12345XX9PLL13": {
    id: "12345XX9PLL13",
    folio: "12345XX9PLL13",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    origin: "cajas",
    invoiceId: "1249941",
    invoiceNumber: "193270",
    createdAt: "2026-04-30",
    status: "pendiente",
    scheduledRoute: {
      id: "582814",
      routeId: "582814",
      status: "pendiente",
      branchName: "Altamira Centro",
      recoveryDate: "2026-05-15",
    },
  },
  "12345XX9PLL14": {
    id: "12345XX9PLL14",
    folio: "12345XX9PLL14",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    origin: "atencion_cliente",
    invoiceId: "1249941",
    invoiceNumber: "193270",
    createdAt: "2026-04-30",
    status: "programada",
    scheduledRoute: {
      id: "582815",
      routeId: "582815",
      status: "pendiente",
      branchName: "Altamira Centro",
      recoveryDate: "2026-05-15",
    },
    serviceOrder: {
      id: "1234568",
      serviceOrderId: "OS-1249941-1",
      status: "por_realizar",
      title: "Sofá hundido",
      generatedAt: "2026-05-03",
      comment:
        "El cliente comenta que se ha hundido una parte del asiento del sofa a los pocos días de comprarlo",
    },
  },
  "12345XX9PLL15": {
    id: "12345XX9PLL15",
    folio: "12345XX9PLL15",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    origin: "cajas",
    invoiceId: "1249941",
    invoiceNumber: "193270",
    createdAt: "2026-04-30",
    status: "recuperada",
    warehouse: {
      branchId: 1,
      branchName: "Matriz",
      itemCondition: "danado",
      entryDate: "2026-05-15",
    },
    scheduledRoute: {
      id: "582816",
      routeId: "582816",
      status: "finalizada",
      branchName: "Altamira Centro",
      recoveryDate: "2026-05-15",
    },
    serviceOrder: {
      id: "1234569",
      serviceOrderId: "OS-1249941-1",
      status: "por_realizar",
      title: "Sofá hundido",
      generatedAt: "2026-05-03",
      comment:
        "El cliente comenta que se ha hundido una parte del asiento del sofa a los pocos días de comprarlo",
    },
  },
  "12345XX9PLL16": {
    id: "12345XX9PLL16",
    folio: "12345XX9PLL16",
    articleCode: "04-EN-00101",
    articleDescription: "Sofa Cama Gris Venecia",
    origin: "atencion_cliente",
    invoiceId: "1249941",
    invoiceNumber: "193270",
    createdAt: "2026-04-30",
    status: "pendiente",
  },
};

let listItemsStore: RecoverySheetListItem[] = structuredClone(seedListItems);
let detailsStore: Record<string, RecoverySheetDetail> =
  structuredClone(seedDetails);

export const MOCK_RECOVERY_SHEET_BRANCHES = [
  { id: 1, name: "Matriz" },
  { id: 2, name: "Altamira Centro" },
  { id: 3, name: "Tampico Norte" },
];

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function matchesSearch(item: RecoverySheetListItem, search?: string): boolean {
  if (!search?.trim()) return true;
  const query = search.trim().toLowerCase();
  return (
    item.folio.toLowerCase().includes(query) ||
    item.articleCode.toLowerCase().includes(query) ||
    item.articleDescription.toLowerCase().includes(query) ||
    item.id.toLowerCase().includes(query)
  );
}

function matchesOriginFilter(
  item: RecoverySheetListItem,
  origin?: RecoverySheetOrigin | "all",
): boolean {
  if (!origin || origin === "all") return true;
  return item.origin === origin;
}

function matchesStatusTab(
  item: RecoverySheetListItem,
  statusTab?: string,
): boolean {
  if (!statusTab || statusTab === "all") return true;
  if (statusTab === "recuperada") {
    return item.status === "recuperada";
  }
  return item.status === statusTab;
}

export function getMockRecoverySheetListItems(): RecoverySheetListItem[] {
  return structuredClone(listItemsStore);
}

export async function getMockRecoverySheets(params: {
  page: number;
  limit: number;
  search?: string;
  statusTab?: string;
  originFilter?: RecoverySheetOrigin | "all";
}): Promise<{ rows: RecoverySheetListItem[]; total: number }> {
  await delay();

  const filtered = listItemsStore
    .filter((item) => matchesSearch(item, params.search))
    .filter((item) => matchesOriginFilter(item, params.originFilter))
    .filter((item) => matchesStatusTab(item, params.statusTab))
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const offset = (params.page - 1) * params.limit;
  return {
    rows: structuredClone(filtered.slice(offset, offset + params.limit)),
    total: filtered.length,
  };
}

export async function getMockRecoverySheetDetail(
  id: string,
): Promise<RecoverySheetDetail | null> {
  await delay();
  const detail = detailsStore[id];
  return detail ? structuredClone(detail) : null;
}

export async function updateMockRecoverySheetStatus(
  id: string,
  status: RecoverySheetStatus,
): Promise<RecoverySheetDetail> {
  await delay();

  const detail = detailsStore[id];
  if (!detail) {
    throw new Error("Hoja de recuperación no encontrada");
  }

  const updated: RecoverySheetDetail = { ...detail, status };
  detailsStore[id] = updated;
  listItemsStore = listItemsStore.map((item) =>
    item.id === id ? { ...item, status } : item,
  );

  return structuredClone(updated);
}

export async function receiveMockRecoveryItem(
  id: string,
  payload: ReceiveRecoveryItemPayload,
): Promise<RecoverySheetDetail> {
  await delay();

  const detail = detailsStore[id];
  if (!detail) {
    throw new Error("Hoja de recuperación no encontrada");
  }

  const updated: RecoverySheetDetail = {
    ...detail,
    status: "recuperada",
    warehouse: {
      branchId: payload.branchId,
      branchName: payload.branchName,
      itemCondition: payload.itemCondition,
      entryDate: payload.receivedDate,
    },
    scheduledRoute: detail.scheduledRoute
      ? { ...detail.scheduledRoute, status: "finalizada" }
      : detail.scheduledRoute,
  };

  detailsStore[id] = updated;
  listItemsStore = listItemsStore.map((item) =>
    item.id === id ? { ...item, status: "recuperada" } : item,
  );

  return structuredClone(updated);
}

export async function searchMockRecoverySheets(
  query: string,
): Promise<RecoverySheetListItem[]> {
  await delay(300);

  if (!query.trim()) return [];

  const results = listItemsStore.filter((item) => matchesSearch(item, query));
  if (results.length > 0) return structuredClone(results);

  return [structuredClone(listItemsStore[0])];
}

export function getMockRecoverySheetIdByInvoiceId(
  invoiceId: string,
): string | null {
  const match = Object.values(detailsStore).find(
    (detail) => detail.invoiceId === invoiceId,
  );
  return match?.id ?? SEED_RECOVERY_SHEET_ID;
}
