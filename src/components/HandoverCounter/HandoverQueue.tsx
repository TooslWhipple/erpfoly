import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { QrCode } from "lucide-react";
import { CardListPagination } from "@/components/CardListPagination";
import {
  HOLD_STATUS_LABELS,
  HOLD_STATUS_VARIANTS,
  formatHoldDate,
  formatUnits,
} from "@/components/DeliveryHolds/holds";
import { ProductCodeScannerDialog } from "@/components/ProductCodeScannerDialog";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { TabFilters } from "@/components/TabFilters/TabFilters";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { getHandoverQueue } from "@/services/sale-handover.service";
import type { QueueReadiness, QueueRow } from "@/types/saleHandover.types";
import {
  HANDOVER_STATUS_LABELS,
  HANDOVER_STATUS_VARIANTS,
} from "@/utils/saleStatus";
import { usePermissions } from "@/hooks/usePermissions";
import { DELIVERY_HANDOVER_UPDATE } from "@/lib/permissions";
import { HandoverNotice } from "./HandoverNotice";
import { canProcess, parseSaleQr } from "./handover";

const SEARCH_DEBOUNCE_MS = 300;
const QUEUE_PAGE_SIZE = 10;

export interface HandoverQueueProps {
  /** `null` = todas las sucursales del alcance de lectura. */
  branchId: number | null;
  /** `ANY` incluye órdenes por surtir o en camino. */
  readiness: QueueReadiness;
  onOpenSale: (saleId: number) => void;
}

export function HandoverQueue({
  branchId,
  readiness,
  onOpenSale,
}: HandoverQueueProps) {
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    "",
    SEARCH_DEBOUNCE_MS,
  );
  const [scannerOpen, setScannerOpen] = useState(false);

  const {
    data: rows,
    total,
    page,
    rowsPerPage,
    setPage,
    setSearch,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePaginatedList<QueueRow>({
    queryKey: ["sale-handover", "queue"],
    queryFn: (params) =>
      getHandoverQueue({
        ...(branchId !== null ? { branchId } : {}),
        readiness,
        search: params.search,
        page: params.page,
        limit: params.limit,
      }),
    initialRowsPerPage: QUEUE_PAGE_SIZE,
    extraParams: { branchId: branchId ?? "all", readiness },
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleCodeScanned = (code: string) => {
    const saleId = parseSaleQr(code);
    if (saleId !== null) {
      onOpenSale(saleId);
      return;
    }
    setSearchInput(code);
  };

  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <TabFilters
            tabs={[]}
            activeTab=""
            onTabChange={() => {}}
            showSearch
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Buscar por folio o nombre del cliente"
          />
        </Box>
        <Button
          variant="outlined"
          startIcon={<QrCode size={18} aria-hidden />}
          onClick={() => setScannerOpen(true)}
          sx={{ flexShrink: 0 }}
        >
          Escanear QR
        </Button>
      </Stack>

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {error?.message ?? "No se pudo cargar la cola de entregas."}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack alignItems="center" py={6} spacing={1.5}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Cargando entregas...
          </Typography>
        </Stack>
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <Stack alignItems="center" py={6} spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            {isSearching
              ? "No hay ventas que coincidan con la búsqueda"
              : "No hay entregas pendientes"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSearching
              ? "Revisa el folio o el nombre, o escanea el QR del ticket."
              : "Las ventas con artículos listos para entregar aparecerán aquí."}
          </Typography>
        </Stack>
      ) : null}

      {rows.length > 0 ? (
        <Stack spacing={1.5} sx={{ opacity: isFetching ? 0.6 : 1 }}>
          {rows.map((row) => (
            <HandoverQueueCard
              key={row.saleId}
              row={row}
              onOpen={() => onOpenSale(row.saleId)}
            />
          ))}
        </Stack>
      ) : null}

      <CardListPagination
        page={page}
        total={total}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        variant="compact"
        disabled={isFetching}
      />

      <ProductCodeScannerDialog
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCodeScanned={handleCodeScanned}
      />
    </Stack>
  );
}

function HandoverQueueCard({
  row,
  onOpen,
}: {
  row: QueueRow;
  onOpen: () => void;
}) {
  const { hasPermission } = usePermissions();
  const processable = canProcess(row, hasPermission(DELIVERY_HANDOVER_UPDATE));
  return (
    <Box
      component="button"
      type="button"
      onClick={onOpen}
      sx={{
        all: "unset",
        boxSizing: "border-box",
        display: "block",
        width: "100%",
        cursor: "pointer",
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        "&:hover, &:focus-visible": { borderColor: "primary.main" },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
      >
        <Stack spacing={0.25} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700}>
            {row.folio}
          </Typography>
          <Typography variant="body2" noWrap>
            {row.clientName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Entrega en {row.deliveryBranch.name} · Responsable: {row.saleBranchName}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <StatusChip
            size="small"
            label={HANDOVER_STATUS_LABELS[row.handoverStatus]}
            variant={HANDOVER_STATUS_VARIANTS[row.handoverStatus]}
          />
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Listas: ${formatUnits(row.readyUnits)}`}
          />
          {row.pendingUnits > row.readyUnits ? (
            <Chip
              size="small"
              variant="outlined"
              label={`Pendientes: ${formatUnits(row.pendingUnits)}`}
            />
          ) : null}
          {!processable ? (
            <Chip size="small" variant="outlined" label="Solo lectura" />
          ) : null}
          {row.hold ? (
            <StatusChip
              size="small"
              variant={HOLD_STATUS_VARIANTS[row.hold.status]}
              label={`${HOLD_STATUS_LABELS[row.hold.status]} · ${formatHoldDate(row.hold.expiresAt)}`}
            />
          ) : null}
        </Stack>
      </Stack>
      <HandoverNotice
        blockReason={row.blockReason}
        incomingTransfers={row.incomingTransfers}
        sx={{ mt: 1.5 }}
      />
    </Box>
  );
}
