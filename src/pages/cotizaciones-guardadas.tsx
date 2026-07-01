import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, InputAdornment, Stack } from "@mui/material";
import { Search } from "lucide-react";
import { MainLayout, Title, TableCrud, FormTextField } from "@/components";
import { theme } from "@/styles/theme";
import type { Column, RowAction } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getQuotations } from "@/services/cotizaciones.service";
import type { QuotationListItem } from "@/types/cotizaciones.types";
import type { SalePaymentType } from "@/types/ventas.types";
import { QUOTATIONS_READ } from "@/lib/permissions";

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
  } = usePaginatedList<QuotationListItem>({
    queryKey: ["quotations"],
    queryFn: getQuotations,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const columns: Column<QuotationListItem>[] = [
    {
      id: "id",
      label: "ID",
      size: "sm",
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      format: () => (
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: "grey.100",
            fontSize: "0.78rem",
            color: "text.secondary",
          }}
        >
          Cotización
        </Box>
      ),
    },
    {
      id: "productName",
      label: "Artículo",
      size: "xl",
      format: (value, row) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          {row.productImageUrl && (
            <Box
              component="img"
              src={row.productImageUrl}
              alt={String(value ?? "")}
              sx={{ width: 36, height: 36, borderRadius: 1, objectFit: "cover", flexShrink: 0 }}
            />
          )}
          <Box
            component="span"
            sx={{
              fontSize: "0.85rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 200,
            }}
          >
            {String(value ?? "—")}
          </Box>
        </Stack>
      ),
    },
    {
      id: "clientName",
      label: "Cliente",
      size: "lg",
      truncate: true,
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "createdAt",
      label: "Fecha",
      size: "md",
      format: (value) => {
        if (!value) return "—";
        try {
          const date = new Date(String(value));
          const diffMs = Date.now() - date.getTime();
          const diffMin = Math.floor(diffMs / 60000);
          if (diffMin < 60) return `Hace ${diffMin} min`;
          const diffH = Math.floor(diffMin / 60);
          if (diffH < 24) return `Hace ${diffH} h`;
          return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
        } catch {
          return "—";
        }
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
        return <span style={{ color, fontWeight: 500, fontSize: "0.85rem" }}>{label}</span>;
      },
    },
  ];

  const actions: RowAction<QuotationListItem>[] = [
    {
      id: "ver",
      label: "Ver cotización",
      onClick: (row) => void router.push(`/cotizaciones/${row.id}`),
      permission: QUOTATIONS_READ,
    },
  ];

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
          <Title title="Cotizaciones guardadas" />
          <Box sx={{ width: { xs: "100%", sm: 320 }, flexShrink: 0 }}>
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
    </MainLayout>
  );
}
