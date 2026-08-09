import { useEffect } from "react";
import { useRouter } from "next/router";
import { Stack, Typography, useTheme } from "@mui/material";
import { Title, TableCrud } from "@/components";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { getMerchandiseReceptionDiscrepancies } from "@/services/merchandise-reception-discrepancies.service";
import type {
  MerchandiseReceptionDiscrepancyListItem,
  MerchandiseReceptionDiscrepancyStatus,
} from "@/types/merchandise-reception-discrepancies.types";
import { formatDate } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import numeral from "numeral";

const STATUS_CHIP_LABELS: Record<MerchandiseReceptionDiscrepancyStatus, string> =
  {
    pending: "Pendiente",
    paid: "Pagado",
  };

const STATUS_CHIP_VARIANTS: Record<
  MerchandiseReceptionDiscrepancyStatus,
  StatusChipVariant
> = {
  pending: "default",
  paid: "success",
};

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export default function MerchandiseReceptionDiscrepanciesPage() {
  const router = useRouter();
  const theme = useTheme();
  const showError = useSnackbarStore((state) => state.showError);

  const {
    data: rows,
    total: totalRows,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    isLoading: loading,
    isError,
    error,
  } = usePaginatedList<MerchandiseReceptionDiscrepancyListItem>({
    queryKey: ["merchandise-reception-discrepancies"],
    queryFn: getMerchandiseReceptionDiscrepancies,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
  });

  useEffect(() => {
    if (isError) {
      showError(
        error?.message ??
          "No se pudieron cargar las discrepancias en recepción de mercancía",
      );
    }
  }, [error?.message, isError, showError]);

  const columns: Column<MerchandiseReceptionDiscrepancyListItem>[] = [
    {
      id: "supplierName",
      label: "Proveedor",
      size: "lg",
      truncate: true,
    },
    {
      id: "receptionDate",
      label: "Fecha de recepción",
      size: "md",
      format: (_value, row) => formatDate(row.receptionDate, "dateLong"),
    },
    {
      id: "itemsTotal",
      label: "Total artículos",
      size: "md",
      type: "currency",
    },
    {
      id: "invoicedTotal",
      label: "Total facturado",
      size: "md",
      type: "currency",
    },
    {
      id: "discrepancy",
      label: "Discrepancia",
      size: "md",
      format: (_value, row) => (
        <Typography
          component="span"
          variant="body2"
          fontWeight={600}
          sx={{
            color:
              row.discrepancy > 0
                ? theme.palette.error.main
                : theme.palette.text.primary,
          }}
        >
          {formatCurrency(row.discrepancy)}
        </Typography>
      ),
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: STATUS_CHIP_LABELS,
      chipVariantMap: STATUS_CHIP_VARIANTS,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Discrepancias en recepción de mercancía" />

      <TableCrud
        columns={columns}
        rows={rows}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => {
          void router.push(`/facturas/discrepancias/${row.id}`);
        }}
        emptyMessage="No hay discrepancias registradas"
      />
    </Stack>
  );
}
