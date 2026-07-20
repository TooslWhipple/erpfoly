import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Title, TabFilters, TableCrud } from "@/components";
import type { Column } from "@/components/TableCrud";
import { ConfirmModal } from "@/components/ConfirmModal";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getRedDeliveries, cancelRedDelivery } from "@/services/ventas.service";
import type { RedDeliveryListItem } from "@/types/ventas.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { formatDate } from "@/utils/date";
import {
  SALE_STATUS_CHIP_LABELS,
  SALE_STATUS_CHIP_VARIANTS,
} from "@/utils/saleStatus";

const SEARCH_DEBOUNCE_MS = 300;

export default function VentasEnRojo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const snackbar = useSnackbarStore();
  const [cancelTarget, setCancelTarget] = useState<RedDeliveryListItem | null>(
    null,
  );

  const {
    data: deliveries,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
  } = usePaginatedList<RedDeliveryListItem>({
    queryKey: ["red-deliveries"],
    queryFn: getRedDeliveries,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
  });
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const cancelMutation = useMutation({
    mutationFn: async (saleId: number) => {
      const res = await cancelRedDelivery(saleId, {});
      if (res.error) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["red-deliveries"] });
      snackbar.showSuccess("Venta cancelada, la mercancía regresó a stock");
      setCancelTarget(null);
    },
    onError: (err: Error) => snackbar.showError(err.message),
  });

  const columns: Column<RedDeliveryListItem>[] = [
    {
      id: "folio",
      label: "FOLIO",
      size: "sm",
    },
    {
      id: "clientName",
      label: "CLIENTE",
      size: "lg",
      format: (value) => String(value ?? "—"),
    },
    {
      id: "saleStatus",
      label: "ESTATUS VENTA",
      size: "sm",
      type: "chip",
      chipLabelMap: SALE_STATUS_CHIP_LABELS,
      chipVariantMap: SALE_STATUS_CHIP_VARIANTS,
    },
    {
      id: "saleCreatedAt",
      label: "FECHA DE VENTA",
      size: "md",
      format: (value) => formatDate(value as string, "dateNumeric"),
    },
    {
      id: "flaggedAt",
      label: "EN REVISIÓN DESDE",
      size: "md",
      format: (value) => formatDate(value as string, "dateNumeric"),
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title
        title="Ventas en rojo"
        description="Ventas con 90 días o más sin entregar, pendientes de decisión de cancelación."
      />

      <TabFilters
        tabs={[]}
        activeTab=""
        onTabChange={() => {}}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar por folio o cliente"
      />

      <TableCrud
        columns={columns}
        rows={deliveries}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => void router.push(`/ventas/${row.saleId}`)}
        emptyMessage="No hay ventas en rojo pendientes de revisión"
        actions={[
          {
            id: "cancel",
            label: "Cancelar venta",
            color: "error",
            onClick: (row) => setCancelTarget(row),
          },
        ]}
      />

      <ConfirmModal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={async () => {
          if (!cancelTarget) return;
          await cancelMutation.mutateAsync(cancelTarget.saleId);
        }}
        loading={cancelMutation.isPending}
        title="Cancelar venta en rojo"
        description="Esta acción cancelará la venta y regresará la mercancía a stock. Esta decisión no se puede deshacer. ¿Deseas continuar?"
        confirmLabel="Cancelar venta"
        cancelLabel="Volver"
        confirmColor="error"
      />
    </Stack>
  );
}
