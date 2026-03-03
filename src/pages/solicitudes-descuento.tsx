import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, Typography } from "@mui/material";
import { MainLayout, Title, TabFilters, TableCrud } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { getDiscountRequests } from "@/services/discount-requests.service";
import type {
  DiscountRequest,
  DiscountRequestStatus,
  DiscountRequestType,
} from "@/types/discount-requests.types";
import { formatDateTimeShort } from "@/utils/date";

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS: TabOption[] = [
  { label: "Pendientes", value: "pending" },
  { label: "Aceptadas", value: "accepted" },
  { label: "Rechazadas", value: "rejected" },
];

const TYPE_CHIP_LABELS: Record<DiscountRequestType, string> = {
  contado: "Contado",
  credito: "Crédito",
};
const TYPE_CHIP_VARIANTS: Record<DiscountRequestType, StatusChipVariant> = {
  contado: "warning",
  credito: "default",
};

// ============================================================================
// HELPERS
// ============================================================================

function formatArticleCount(count: number): string {
  return count === 1 ? "1 artículo" : `${count} artículos`;
}

// ============================================================================
// PAGE
// ============================================================================

export default function SolicitudesDescuentoPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [searchValue, setSearchValue] = useState("");
  const [requests, setRequests] = useState<DiscountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDiscountRequests({
        page,
        limit: rowsPerPage,
        status: activeTab as DiscountRequestStatus,
        search: searchValue || undefined,
      });
      setRequests(response.data);
      setTotalRows(response.total);
    } catch (err) {
      console.error("[SolicitudesDescuento] Error fetching:", err);
      setError("Error al cargar las solicitudes de descuento");
      setRequests([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab, searchValue]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    setPage(0);
  }, [activeTab, searchValue]);

  const handleTabChange = (value: string) => setActiveTab(value);
  const handleSearchChange = (value: string) => setSearchValue(value);
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const columns: Column<DiscountRequest>[] = [
    {
      id: "id",
      label: "ID",
      size: "sm",
      type: "id",
      idPadding: 6,
    },
    {
      id: "createdAt",
      label: "FECHA Y HORA",
      size: "md",
      format: (value) => formatDateTimeShort(value != null ? String(value) : null),
    },
    {
      id: "type",
      label: "TIPO",
      size: "sm",
      type: "chip",
      chipLabelMap: TYPE_CHIP_LABELS,
      chipVariantMap: TYPE_CHIP_VARIANTS,
    },
    {
      id: "customerName",
      label: "CLIENTE",
      size: "lg",
      truncate: true,
    },
    {
      id: "articleCount",
      label: "ARTÍCULOS",
      size: "sm",
      format: (value) => formatArticleCount(Number(value ?? 0)),
    },
    {
      id: "amount",
      label: "MONTO",
      size: "md",
      type: "currency",
      currencySymbol: "$",
    },
    {
      id: "reason",
      label: "MOTIVO",
      size: "xl",
      truncate: true,
    },
  ];

  return (
    <MainLayout>
      <Title title="Solicitudes de descuentos" />

      <TabFilters
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar"
        actions={[
          {
            label: "Nuevo",
            variant: "contained",
            color: "primary",
            showIcon: false,
            onClick: () => router.push("/solicitudes-descuento/nuevo"),
          },
        ]}
      />

      {error ? (
        <Box
          sx={{
            py: 4,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <TableCrud<DiscountRequest>
          columns={columns}
          rows={requests}
          loading={loading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          emptyMessage="No hay solicitudes de descuento"
        />
      )}
    </MainLayout>
  );
}
