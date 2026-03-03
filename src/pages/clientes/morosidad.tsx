import { useState, useEffect, useCallback } from "react";
import { Link, Typography } from "@mui/material";
import { MainLayout, Title, TabFilters, TableCrud } from "@/components";
import { StatsCardGroup } from "@/components/StatsCard";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type DelinquencyPeriod = "1_day" | "1_week" | "1_month" | "2_months";

interface DelinquentCustomer {
  id: number;
  fullName: string;
  phone: string;
  lastPaymentDate: string;
  dueDate: string;
  delinquencyPeriod: DelinquencyPeriod;
  debtAmount: number;
}

interface DelinquencySummary {
  oneDay: { count: number; change: number; changeType: "increase" | "decrease" };
  oneWeek: { count: number; change: number; changeType: "increase" | "decrease" };
  oneMonth: { count: number; change: number; changeType: "increase" | "decrease" };
  twoMonths: { count: number; change: number; changeType: "increase" | "decrease" };
}

interface GetDelinquentCustomersParams {
  page: number;
  limit: number;
  period?: string;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

interface GetDelinquentCustomersResponse {
  data: DelinquentCustomer[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// MOCK DATA - Realistic dummy data for e-commerce financial system
// ============================================================================

const DUMMY_SUMMARY: DelinquencySummary = {
  oneDay: { count: 2533, change: 32, changeType: "increase" },
  oneWeek: { count: 1034, change: 12, changeType: "decrease" },
  oneMonth: { count: 821, change: 12, changeType: "decrease" },
  twoMonths: { count: 785, change: 150, changeType: "decrease" },
};

const DUMMY_CUSTOMERS: DelinquentCustomer[] = [
  {
    id: 1,
    fullName: "María Daniela Montes Ávila",
    phone: "667 123 4567",
    lastPaymentDate: "1 de Abril, 2025",
    dueDate: "17 de Junio, 2025",
    delinquencyPeriod: "1_day",
    debtAmount: 4930.0,
  },
  {
    id: 2,
    fullName: "Carlos Alberto Ramírez Torres",
    phone: "664 892 3451",
    lastPaymentDate: "17 de Abril, 2025",
    dueDate: "17 de Mayo, 2025",
    delinquencyPeriod: "1_month",
    debtAmount: 4051.0,
  },
  {
    id: 3,
    fullName: "Ana Patricia Hernández López",
    phone: "668 234 5678",
    lastPaymentDate: "11 de Abril, 2025",
    dueDate: "11 de Junio, 2025",
    delinquencyPeriod: "1_week",
    debtAmount: 3877.0,
  },
  {
    id: 4,
    fullName: "José Luis García Martínez",
    phone: "669 876 5432",
    lastPaymentDate: "13 de Abril, 2025",
    dueDate: "13 de Junio, 2025",
    delinquencyPeriod: "1_week",
    debtAmount: 3500.0,
  },
  {
    id: 5,
    fullName: "Laura Fernanda Sánchez Ruiz",
    phone: "662 345 6789",
    lastPaymentDate: "15 de Abril, 2025",
    dueDate: "15 de Junio, 2025",
    delinquencyPeriod: "1_day",
    debtAmount: 3290.0,
  },
  {
    id: 6,
    fullName: "Roberto Javier Mendoza Cruz",
    phone: "665 567 8901",
    lastPaymentDate: "17 de Abril, 2025",
    dueDate: "17 de Mayo, 2025",
    delinquencyPeriod: "1_day",
    debtAmount: 2300.0,
  },
  {
    id: 7,
    fullName: "Gabriela Sofía Morales Flores",
    phone: "663 678 9012",
    lastPaymentDate: "13 de Abril, 2025",
    dueDate: "13 de Junio, 2025",
    delinquencyPeriod: "1_day",
    debtAmount: 2300.0,
  },
  {
    id: 8,
    fullName: "Miguel Ángel Castillo Vargas",
    phone: "667 789 0123",
    lastPaymentDate: "17 de Abril, 2025",
    dueDate: "17 de Mayo, 2025",
    delinquencyPeriod: "1_month",
    debtAmount: 1432.0,
  },
  {
    id: 9,
    fullName: "Diana Carolina Ortiz Navarro",
    phone: "661 890 1234",
    lastPaymentDate: "20 de Abril, 2025",
    dueDate: "20 de Junio, 2025",
    delinquencyPeriod: "2_months",
    debtAmount: 5200.0,
  },
  {
    id: 10,
    fullName: "Fernando Antonio Rivera Espinoza",
    phone: "664 901 2345",
    lastPaymentDate: "22 de Abril, 2025",
    dueDate: "22 de Mayo, 2025",
    delinquencyPeriod: "2_months",
    debtAmount: 3890.0,
  },
  {
    id: 11,
    fullName: "Alejandra Beatriz Fuentes Vega",
    phone: "668 012 3456",
    lastPaymentDate: "5 de Mayo, 2025",
    dueDate: "5 de Junio, 2025",
    delinquencyPeriod: "1_week",
    debtAmount: 2750.0,
  },
  {
    id: 12,
    fullName: "Ricardo Ernesto Guzmán Peña",
    phone: "666 123 4567",
    lastPaymentDate: "8 de Mayo, 2025",
    dueDate: "8 de Junio, 2025",
    delinquencyPeriod: "1_day",
    debtAmount: 1890.0,
  },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getDelinquencySummary(): Promise<DelinquencySummary> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return DUMMY_SUMMARY;
}

async function getDelinquentCustomers(
  params: GetDelinquentCustomersParams
): Promise<GetDelinquentCustomersResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredData = [...DUMMY_CUSTOMERS];

  // Filter by period
  if (params.period && params.period !== "all") {
    filteredData = filteredData.filter((c) => c.delinquencyPeriod === params.period);
  }

  // Filter by search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter(
      (c) =>
        c.fullName.toLowerCase().includes(searchLower) ||
        c.phone.includes(params.search!)
    );
  }

  // Sort by due date if requested
  if (params.sortField === "dueDate") {
    filteredData.sort((a, b) => {
      const dateA = new Date(a.dueDate).getTime();
      const dateB = new Date(b.dueDate).getTime();
      return params.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }

  const total = filteredData.length;
  const start = params.page * params.limit;
  const end = start + params.limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    total,
    page: params.page,
    limit: params.limit,
  };
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

const TABS: TabOption[] = [
  { label: "Todos", value: "all" },
  { label: "1 día", value: "1_day" },
  { label: "1 semana", value: "1_week" },
  { label: "1 mes", value: "1_month" },
  { label: "2 meses", value: "2_months" },
  { label: "Listas compartidas", value: "shared_lists" },
];

const DELINQUENCY_CHIP_LABELS: Record<string, string> = {
  "1_day": "1 día",
  "1_week": "1 semana",
  "1_month": "1 mes",
  "2_months": "2 meses",
  "2_days": "2 días",
  "5_days": "5 días",
};
const DELINQUENCY_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  "1_day": "default",
  "1_week": "error",
  "1_month": "error",
  "2_months": "error",
  "2_days": "default",
  "5_days": "default",
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ClientesMorosidad() {
  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [customers, setCustomers] = useState<DelinquentCustomer[]>([]);
  const [summary, setSummary] = useState<DelinquencySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    try {
      const data = await getDelinquencySummary();
      setSummary(data);
    } catch (err) {
      console.error("[Morosidad] Error fetching summary:", err);
    }
  }, []);

  // Fetch customers data
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const period = activeTab !== "shared_lists" ? activeTab : "all";

      const response = await getDelinquentCustomers({
        page,
        limit: rowsPerPage,
        period,
        search: searchValue,
      });

      setCustomers(response.data);
      setTotalRows(response.total);
    } catch (err) {
      console.error("[Morosidad] Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab, searchValue]);

  // Effects
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    setPage(0);
  }, [activeTab, searchValue]);

  // Event handlers
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleViewCustomer = (customer: DelinquentCustomer) => {
    console.log("[Morosidad] View customer:", customer.id);
    // Navigate to customer detail page
  };

  const handleContactCustomer = (customer: DelinquentCustomer) => {
    console.log("[Morosidad] Contact customer:", customer.phone);
    // Open contact modal or initiate call
  };

  const handleRegisterPayment = (customer: DelinquentCustomer) => {
    console.log("[Morosidad] Register payment for:", customer.id);
    // Open payment registration modal
  };

  // Build stats cards data
  const statsCards: StatsCardData[] = summary
    ? [
        {
          id: "one_day",
          label: "1 día",
          value: summary.oneDay.count,
          comparison: {
            value: summary.oneDay.change,
            type: summary.oneDay.changeType,
            period: "el mes anterior",
          },
        },
        {
          id: "one_week",
          label: "1 semana",
          value: summary.oneWeek.count,
          comparison: {
            value: summary.oneWeek.change,
            type: summary.oneWeek.changeType,
            period: "el mes anterior",
          },
        },
        {
          id: "one_month",
          label: "1 mes",
          value: summary.oneMonth.count,
          comparison: {
            value: summary.oneMonth.change,
            type: summary.oneMonth.changeType,
            period: "el mes anterior",
          },
        },
        {
          id: "two_months",
          label: "2 meses",
          value: summary.twoMonths.count,
          comparison: {
            value: summary.twoMonths.change,
            type: summary.twoMonths.changeType,
            period: "el mes anterior",
          },
        },
      ]
    : [];

  // Table columns configuration
  const columns: Column<DelinquentCustomer>[] = [
    {
      id: "fullName",
      label: "CLIENTE",
      size: "xl",
      format: (value, row) => (
        <Link
          component="button"
          onClick={() => handleViewCustomer(row)}
          sx={{
            color: "text.primary",
            textDecoration: "underline",
            textDecorationColor: "text.secondary",
            fontWeight: 400,
            cursor: "pointer",
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          {String(value)}
        </Link>
      ),
    },
    {
      id: "phone",
      label: "TELÉFONO",
      size: "md",
    },
    {
      id: "lastPaymentDate",
      label: "ÚLTIMO PAGO",
      size: "md",
    },
    {
      id: "dueDate",
      label: "Fecha de vencimiento",
      size: "lg",
    },
    {
      id: "delinquencyPeriod",
      label: "MOROSIDAD",
      size: "sm",
      type: "chip",
      align: "center",
      chipLabelMap: DELINQUENCY_CHIP_LABELS,
      chipVariantMap: DELINQUENCY_CHIP_VARIANTS,
    },
    {
      id: "debtAmount",
      label: "DEUDA",
      type: "currency",
      size: "md",
      align: "right",
    },
  ];

  // Row actions configuration
  const actions: RowAction<DelinquentCustomer>[] = [
    {
      id: "view",
      label: "Ver detalle",
      onClick: handleViewCustomer,
    },
    {
      id: "contact",
      label: "Contactar",
      onClick: handleContactCustomer,
      color: "primary",
    },
    {
      id: "payment",
      label: "Registrar pago",
      onClick: handleRegisterPayment,
      color: "primary",
    },
  ];

  return (
    <MainLayout>
      <Title title="Morosidad" />

      {summary && <StatsCardGroup cards={statsCards} />}

      <TabFilters
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar por nombre"
      />

      <TableCrud
        columns={columns}
        rows={customers}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="No hay clientes con morosidad"
      />
    </MainLayout>
  );
}
