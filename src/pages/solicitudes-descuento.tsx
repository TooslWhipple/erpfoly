import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Typography } from "@mui/material";
import { MainLayout, Title, TabFilters, TableCrud } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, ChipStyleConfig } from "@/components/TableCrud";
import { getDiscountRequests } from "@/services/discount-requests.service";
import type {
  DiscountRequest,
  DiscountRequestStatus,
  DiscountRequestType,
} from "@/types/discount-requests.types";

// ============================================================================
// CONSTANTS
// ============================================================================

const TABS: TabOption[] = [
  { label: "Pendientes", value: "pending" },
  { label: "Aceptadas", value: "accepted" },
  { label: "Rechazadas", value: "rejected" },
];

const TYPE_CHIP_CONFIG: Record<DiscountRequestType, ChipStyleConfig> = {
  contado: {
    label: "Contado",
    bgColor: "#FEF9C3",
    textColor: "#713F12",
  },
  credito: {
    label: "Crédito",
    bgColor: "#DBEAFE",
    textColor: "#1E3A8A",
  },
};

// ============================================================================
// HELPERS
// ============================================================================

const SHORT_MONTHS_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  const day = d.getDate();
  const month = SHORT_MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  const h = hours % 12 || 12;
  const min = minutes < 10 ? `0${minutes}` : minutes;
  return `${day} ${month}, ${year} ${h}:${min} ${ampm}`;
}

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
      format: (value) => formatDateTime(String(value ?? "")),
    },
    {
      id: "type",
      label: "TIPO",
      size: "sm",
      type: "chip",
      chipConfig: TYPE_CHIP_CONFIG,
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
