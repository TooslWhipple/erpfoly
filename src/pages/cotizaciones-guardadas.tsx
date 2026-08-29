import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, InputAdornment, Stack } from "@mui/material";
import { Search } from "lucide-react";
import { Title, TableCrud, FormTextField } from "@/components";
import { theme } from "@/styles/theme";
import type { Column, RowAction } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getSales } from "@/services/ventas.service";
import { formatDate } from "@/utils/date";
import dayjs from "@/lib/dayjs";
import type { SaleListItem, SalePaymentType } from "@/types/ventas.types";
import { QUOTATIONS_READ } from "@/lib/permissions";
import {
  SALE_STATUS_CHIP_LABELS,
  SALE_STATUS_CHIP_VARIANTS,
} from "@/utils/saleStatus";
const SEARCH_DEBOUNCE_MS = 300;
const PAYMENT_TYPE_LABELS: Record<SalePaymentType, string> = {
  CREDIT: "Crédito",
  CASH: "Contado",
  LAYAWAY: "Apartado",
};
const PAYMENT_TYPE_COLORS: Record<SalePaymentType, string> = {
  CREDIT: "#7c3aed",
  CASH: "#2563eb",
  LAYAWAY: "#d97706",
};

function formatItemCount(count: number): string {
  if (count === 1) return "1 artículo";
  return `${count} artículos`;
}

export default function CotizacionesGuardadas() {
  const router = useRouter();
  const {
    data: cotizaciones,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
  } = usePaginatedList<SaleListItem>({
    queryKey: ["sale-drafts"],
    queryFn: getSales,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: {
      status: "DRAFT",
    },
  });
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);
  const columns: Column<SaleListItem>[] = [
    {
      id: "id",
      label: "ID",
      size: "sm",
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: SALE_STATUS_CHIP_LABELS,
      chipVariantMap: SALE_STATUS_CHIP_VARIANTS,
    },
    {
      id: "itemCount",
      label: "Nº artículos",
      size: "sm",
      format: (value) => formatItemCount(typeof value === "number" ? value : 0),
    },
    {
      id: "clientName",
      label: "Cliente",
      size: "lg",
      truncate: true,
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "sellerName",
      label: "Vendedor",
      size: "md",
      truncate: true,
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "createdAt",
      label: "Fecha",
      size: "md",
      format: (value) => {
        const d = dayjs(value);
        if (!d.isValid()) return "—";
        const diffMin = dayjs().diff(d, "minute");
        if (diffMin < 60) return `Hace ${diffMin} min`;
        const diffH = dayjs().diff(d, "hour");
        if (diffH < 24) return `Hace ${diffH} h`;
        return formatDate(d, "D MMM");
      },
    },
    {
      id: "paymentType",
      label: "Tipo",
      size: "sm",
      format: (value) => {
        const normalized = String(value ?? "") as SalePaymentType;
        const label = PAYMENT_TYPE_LABELS[normalized] ?? normalized;
        const color = PAYMENT_TYPE_COLORS[normalized] ?? "inherit";
        return (
          <span
            style={{
              color,
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            {label}
          </span>
        );
      },
    },
  ];
  const actions: RowAction<SaleListItem>[] = [
    {
      id: "ver",
      label: "Ver cotización",
      onClick: (row) => void router.push(`/cotizaciones/${row.id}`),
      permission: QUOTATIONS_READ,
    },
  ];
  return (
    <Stack direction="column" spacing={3}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
      >
        <Title title="Cotizaciones guardadas" />
        <Box
          sx={{
            width: {
              xs: "100%",
              sm: 320,
            },
            flexShrink: 0,
          }}
        >
          <FormTextField
            placeholder="Buscar"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Stack>

      <TableCrud
        columns={columns}
        rows={cotizaciones}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No hay cotizaciones guardadas"
        onRowClick={(row) => void router.push(`/cotizaciones/${row.id}`)}
      />
    </Stack>
  );
}
