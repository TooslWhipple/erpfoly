import type {
  Branch,
  SalesDashboardKpis,
  MonthlySalesPoint,
  SellerSalesRow,
  SalesHistoryPoint,
  SellerGoalRow,
  BranchPromotion,
  BranchSettings,
} from "@/types/sucursales.types";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DUMMY_BRANCHES: Record<number, Branch> = {
  1: { id: 1, name: "Sucursal Tampico", city: "Tampico", status: "active" },
  2: { id: 2, name: "Foly Muebles Tampico Centro", city: "Tampico", status: "active" },
  3: { id: 3, name: "Foly Muebles San Luis", city: "San Luis Potosí", status: "active" },
};

const DUMMY_PROMOTIONS: BranchPromotion[] = [
  { id: 1, name: "Crédito permanente", margin: 5, type: "credit", startDate: "2025-09-01", endDate: null, departments: "Todos", lines: "Todos", branches: "Todas" },
  { id: 2, name: "Mes de línea blanca", margin: 32, type: "credit", startDate: "2025-09-01", endDate: "2025-09-30", departments: "Línea blanca", lines: "7 Líneas", branches: "Todas" },
  { id: 3, name: "Buen fin 2024", margin: 25, type: "credit", startDate: "2025-11-13", endDate: "2025-11-17", departments: "Todos", lines: "Todos", branches: "Todas" },
  { id: 4, name: "Black Friday 2024", margin: 20, type: "credit", startDate: "2025-11-28", endDate: "2025-11-28", departments: "Todos", lines: "Todos", branches: "Todas" },
  { id: 5, name: "Día de las madres", margin: 29, type: "cash", startDate: "2025-09-01", endDate: "2025-09-30", departments: "3 dptos", lines: "7 Líneas", branches: "Todas" },
  { id: 6, name: "Aniversario Foly", margin: 29, type: "cash", startDate: "2025-09-01", endDate: "2025-09-30", departments: "Todos", lines: "7 Líneas", branches: "Todas" },
  { id: 7, name: "Día del padre", margin: 29, type: "cash", startDate: "2025-09-01", endDate: "2025-09-30", departments: "Todos", lines: "7 Líneas", branches: "Todas" },
  { id: 8, name: "Temporada de calor", margin: 29, type: "layaway", startDate: "2025-09-01", endDate: "2025-09-30", departments: "Aire acondicio...", lines: "Minisplits", branches: "Todas" },
];

const DUMMY_SELLERS = [
  { id: "1", name: "José Carlos Montes Ávila", previousMonth: 185200, thisMonth: 98200 },
  { id: "2", name: "Luz Maria Ponce Díaz", previousMonth: 124500, thisMonth: 156800 },
  { id: "3", name: "Ramón López", previousMonth: 98700, thisMonth: 112400 },
  { id: "4", name: "Esteban Sánchez Blanco", previousMonth: 142300, thisMonth: 118900 },
];

export async function getBranch(id: number): Promise<Branch | null> {
  await new Promise((r) => setTimeout(r, 200));
  return DUMMY_BRANCHES[id] ?? null;
}

export async function getSalesDashboard(_branchId: number): Promise<SalesDashboardKpis> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    thisMonth: 239540,
    goal: 200000,
    performancePercent: 83,
    closeRatePercent: 23,
    avgTicket: 15540,
  };
}

export async function getMonthlySales(_branchId: number): Promise<MonthlySalesPoint[]> {
  await new Promise((r) => setTimeout(r, 200));
  const baseGoal = 112450.5;
  return MONTH_NAMES.map((month, i) => ({
    month,
    sales: Math.round(baseGoal * (0.75 + Math.random() * 0.4) * 100) / 100,
    goal: Math.round(baseGoal * 100) / 100,
  }));
}

export async function getSalesBySeller(_branchId: number): Promise<SellerSalesRow[]> {
  await new Promise((r) => setTimeout(r, 200));
  return DUMMY_SELLERS.map((s) => ({
    ...s,
    trend: s.thisMonth >= s.previousMonth ? ("up" as const) : ("down" as const),
  }));
}

export async function getSalesHistory(_branchId: number): Promise<SalesHistoryPoint[]> {
  await new Promise((r) => setTimeout(r, 200));
  const baseGoal = 112450.5;
  const labels: string[] = [];
  const points: SalesHistoryPoint[] = [];
  for (let y = 2025; y <= 2026; y++) {
    const start = y === 2025 ? 1 : 1;
    const end = y === 2025 ? 12 : 1;
    for (let m = start; m <= end; m++) {
      labels.push(`${MONTH_NAMES[m - 1].slice(0, 3)}, ${String(y).slice(-2)}`);
      const isFuture = y === 2026 && m === 1;
      points.push({
        label: `${MONTH_NAMES[m - 1].slice(0, 3)}, ${String(y).slice(-2)}`,
        sales: isFuture ? 0 : Math.round(baseGoal * (0.7 + Math.random() * 0.5) * 100) / 100,
        goal: isFuture ? 0 : Math.round(baseGoal * 100) / 100,
      });
    }
  }
  return points;
}

export async function getSellerGoals(
  _branchId: number,
  month: number,
  year: number
): Promise<{ monthLabel: string; totalGoal: number; sellers: SellerGoalRow[] }> {
  await new Promise((r) => setTimeout(r, 300));
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;
  const totalGoal = 480000;
  const perSeller = totalGoal / DUMMY_SELLERS.length;
  const sellers: SellerGoalRow[] = DUMMY_SELLERS.map((s, i) => ({
    id: s.id,
    name: s.name,
    numCredits: 12,
    newCredits: 50000,
    quoteGoal: 600000,
    monthlyGoal: i === 0 ? 120000 : Math.round(perSeller * 100) / 100,
  }));
  return { monthLabel, totalGoal, sellers };
}

export async function getPromotions(branchId: number): Promise<BranchPromotion[]> {
  await new Promise((r) => setTimeout(r, 400));
  return [...DUMMY_PROMOTIONS];
}

export async function getBranchSettings(branchId: number): Promise<BranchSettings> {
  await new Promise((r) => setTimeout(r, 150));
  const branch = DUMMY_BRANCHES[branchId];
  return { name: branch?.name ?? "" };
}

export async function saveBranchSettings(
  branchId: number,
  data: BranchSettings
): Promise<BranchSettings> {
  await new Promise((r) => setTimeout(r, 400));
  if (DUMMY_BRANCHES[branchId]) {
    DUMMY_BRANCHES[branchId].name = data.name;
  }
  return data;
}

export async function deletePromotion(_branchId: number, id: number): Promise<{ success: boolean }> {
  await new Promise((r) => setTimeout(r, 300));
  return { success: true };
}

export async function createPromotion(
  _branchId: number,
  data: Partial<BranchPromotion>
): Promise<BranchPromotion> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    id: Date.now(),
    name: data.name ?? "",
    margin: data.margin ?? 0,
    type: data.type ?? "credit",
    startDate: data.startDate ?? new Date().toISOString().split("T")[0],
    endDate: data.endDate ?? null,
    departments: data.departments ?? "Todos",
    lines: data.lines ?? "Todos",
    branches: data.branches ?? "Todas",
  };
}
