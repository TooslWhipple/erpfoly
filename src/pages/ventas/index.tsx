import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Box, Stack } from "@mui/material";
import { Title, TabFilters, TableCrud } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getSales } from "@/services/ventas.service";
import type { SaleListItem, SalePaymentType, SaleStatusTab } from "@/types/ventas.types";
import { formatDate } from "@/utils/date";
import dayjs from "@/lib/dayjs";
import { SALES_CREATE } from "@/lib/permissions";
import { SALE_STATUS_CHIP_LABELS, SALE_STATUS_CHIP_VARIANTS } from "@/utils/saleStatus";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Finalizadas", value: "finalized" },
  { label: "Realizadas", value: "completed" },
  { label: "Pendientes", value: "pending" },
];

const PAYMENT_TYPE_COLORS: Record<SalePaymentType, string> = {
  CREDIT: "#a855f7",
  CASH: "#10b981",
  LAYAWAY: "#f59e0b",
};

const PAYMENT_TYPE_LABELS: Record<SalePaymentType, string> = {
  CREDIT: "Crédito",
  CASH: "Contado",
  LAYAWAY: "Apartado",
};

function formatRelativeDate(value: unknown): string {
  const d = value == null ? dayjs() : dayjs(value as string | number | Date);
  if (!d.isValid()) return "—";
  const now = dayjs();
  const diffMin = now.diff(d, "minute");
  const diffHours = now.diff(d, "hour");
  const diffDays = now.diff(d, "day");

  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  return formatDate(d, "D MMM");
}

export default function Ventas() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const statusTabExtra =
    activeTab === "all" ? undefined : { statusTab: activeTab as SaleStatusTab };

  const {
    data: ventas,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
  } = usePaginatedList<SaleListItem>({
    queryKey: ["sales", activeTab],
    queryFn: getSales,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: statusTabExtra,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  const tabs = STATUS_TABS.map((t) => ({
    ...t,
    count: t.value === activeTab ? totalRows : undefined,
  }));

  const handleRowClick = (row: SaleListItem) => {
    void router.push(`/ventas/${row.id}`);
  };

  const columns: Column<SaleListItem>[] = [
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: SALE_STATUS_CHIP_LABELS,
      chipVariantMap: SALE_STATUS_CHIP_VARIANTS,
    },
    {
      id: "productName",
      label: "Artículo",
      size: "xl",
      format: (value, row) => (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            component="img"
            src={row.productImageUrl ?? "/placeholder-product.png"}
            alt={String(value ?? "")}
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              objectFit: "cover",
              flexShrink: 0,
              bgcolor: "grey.100",
            }}
          />
          <span>{String(value ?? "—")}</span>
        </Stack>
      ),
    },
    {
      id: "clientName",
      label: "Cliente",
      size: "lg",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "createdAt",
      label: "Fecha",
      size: "md",
      format: (value) => formatRelativeDate(value),
    },
    {
      id: "paymentType",
      label: "Tipo",
      size: "sm",
      format: (value) => {
        const type = value as SalePaymentType;
        const color = PAYMENT_TYPE_COLORS[type] ?? "#6b7280";
        const label = PAYMENT_TYPE_LABELS[type] ?? String(value);
        return (
          <Box
            component="span"
            sx={{
              display: "inline-block",
              px: 1,
              py: 0.25,
              borderRadius: "4px",
              border: `1px solid ${color}`,
              color,
              fontSize: "0.75rem",
              fontWeight: 500,
              lineHeight: 1.6,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Stack direction="column" spacing={3}>
        <Title
          title="Ventas"
          actions={[
            {
              id: "nueva-venta",
              label: "Nueva",
              onClick: () => void router.push("/ventas/nueva"),
              variant: "contained",
              color: "primary",
              permission: SALES_CREATE,
            },
          ]}
        />

        <TabFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
        />

        <TableCrud
          columns={columns}
          rows={ventas}
          loading={loading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onRowClick={handleRowClick}
          emptyMessage="No hay ventas registradas"
        />
      </Stack>
    </>
  );
}
