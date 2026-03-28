import type {
  SellerDetail,
  SellerListItem,
  SellerListResponse,
  SellerMonthlyBreakdownRow,
  SellerMonthlyChartPoint,
  SellerSaleHistoryRow,
} from "@/types/sellers.types";

const MOCK_SELLERS: SellerListItem[] = [
  {
    id: 1,
    fullName: "Julio Armando López Inzunza",
    email: "julio.lopez@foly.com",
    branchName: "Matamoros-Plaza Patio",
  },
  {
    id: 2,
    fullName: "Mariana Gonzalez Carrasco",
    email: "mariana.gonzalez@foly.com",
    branchName: "Sucursal Campestre",
  },
  {
    id: 3,
    fullName: "Ricardo Montes Delgado",
    email: "ricardo.montes@foly.com",
    branchName: "Cumbres-Mty",
  },
  {
    id: 4,
    fullName: "Ana Patricia Ruiz Vega",
    email: "ana.ruiz@foly.com",
    branchName: "Matamoros-Plaza Patio",
  },
];

const MONTH_LABELS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function buildMonthlyBreakdown(seed: number): SellerMonthlyBreakdownRow[] {
  return MONTH_LABELS_ES.map((label, monthIndex) => {
    const base = 95000 + seed * 1200 + monthIndex * 1800;
    const salesAmount = Math.round((base + monthIndex * 4100.5) * 100) / 100;
    const goalAmount = 150000;
    const priorYearSalesAmount = Math.round((salesAmount * 0.82 + monthIndex * 900) * 100) / 100;
    const variationVsGoalPercent = Math.round((salesAmount / goalAmount) * 100);
    const variationVsPriorYearPercent = Math.round((salesAmount / priorYearSalesAmount) * 100);
    return {
      monthIndex,
      monthLabel: label,
      salesAmount,
      goalAmount,
      variationVsGoalPercent,
      priorYearSalesAmount,
      variationVsPriorYearPercent,
    };
  });
}

function buildMonthlyChart(breakdown: SellerMonthlyBreakdownRow[]): SellerMonthlyChartPoint[] {
  return breakdown.map((row) => ({
    monthLabel: row.monthLabel,
    sales: row.salesAmount,
    goal: row.goalAmount,
  }));
}

function buildSalesHistory(sellerId: number): SellerSaleHistoryRow[] {
  const base: SellerSaleHistoryRow[] = [
    {
      id: `${sellerId}-1`,
      code: "04ET 12345",
      dateLabel: "01 Dic, 2025 09:48 am",
      type: "cash",
      articleName: 'Estufa Mabe 30" de Piso EM7654BFIS2 con horno',
      department: "04 - Línea Blanca",
      line: "ET - Estufas",
      amount: 12560.4,
    },
    {
      id: `${sellerId}-2`,
      code: "02RF 88712",
      dateLabel: "28 Nov, 2025 04:12 pm",
      type: "credit",
      articleName: "Refrigerador Whirlpool 14 pies WRW25B",
      department: "02 - Refrigeración",
      line: "RF - Refrigeradores",
      amount: 18990.0,
    },
    {
      id: `${sellerId}-3`,
      code: "01LV 44002",
      dateLabel: "22 Nov, 2025 11:05 am",
      type: "credit",
      articleName: "Lavadora Samsung 19 kg WA19M",
      department: "01 - Lavado",
      line: "LV - Lavadoras",
      amount: 11200.5,
    },
  ];
  return base;
}

function buildSellerDetail(id: number): SellerDetail {
  const listItem = MOCK_SELLERS.find((s) => s.id === id);
  const seed = id * 7;
  const monthlyBreakdown = buildMonthlyBreakdown(seed);
  const monthlyChart = buildMonthlyChart(monthlyBreakdown);
  const currentMonthSales = 128560.0;
  const currentMonthGoal = 200000.0;
  const goalProgressPercent = Math.round((currentMonthSales / currentMonthGoal) * 100);
  const commissionRatePercent = 50;
  const commissionAmount = 12980.0;

  const progressSeries = ["S1", "S2", "S3", "S4"].map((label, i) => ({
    label,
    actual: 42000 + i * 22000 + (id % 5) * 800,
    goal: 50000,
  }));

  return {
    id,
    fullName: listItem?.fullName ?? `Seller ${id}`,
    email: listItem?.email ?? `seller${id}@foly.com`,
    branchName: listItem?.branchName ?? "Sucursal central",
    status: "ACTIVE",
    currentMonthLabel: "Diciembre",
    currentMonthSales,
    currentMonthGoal,
    goalProgressPercent,
    commissionRatePercent,
    commissionAmount,
    progressSeries,
    monthlyChart,
    monthlyBreakdown,
    salesHistory: buildSalesHistory(id),
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export interface FetchSellersParams {
  page: number;
  limit: number;
  search?: string;
}

export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string } };

export async function fetchSellersMock(
  params: FetchSellersParams
): Promise<ServiceResult<SellerListResponse>> {
  await delay(450);
  const rawSearch = params.search?.trim();
  if (rawSearch === "__mock_error__") {
    return { data: null, error: { message: "Could not load sellers (simulated error)." } };
  }
  const q = rawSearch?.toLowerCase();
  let rows = [...MOCK_SELLERS];
  if (q) {
    rows = rows.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.branchName.toLowerCase().includes(q) ||
        String(r.id).includes(q)
    );
  }
  const start = (params.page - 1) * params.limit;
  const pageRows = rows.slice(start, start + params.limit);
  return { data: { rows: pageRows, total: rows.length }, error: null };
}

export async function fetchSellerDetailMock(id: number): Promise<ServiceResult<SellerDetail>> {
  await delay(500);
  if (!Number.isFinite(id) || id <= 0) {
    return { data: null, error: { message: "Invalid seller id" } };
  }
  if (id === 404) {
    return { data: null, error: { message: "Seller not found" } };
  }
  const exists = MOCK_SELLERS.some((s) => s.id === id);
  if (!exists) {
    return { data: null, error: { message: "Seller not found" } };
  }
  return { data: buildSellerDetail(id), error: null };
}
