import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { CardListPagination } from "@/components/CardListPagination";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import { TabFilters } from "@/components/TabFilters/TabFilters";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { usePermissions } from "@/hooks/usePermissions";
import { getHolds } from "@/services/sale-handover.service";
import type { HandoverBranch, HoldRow, HoldStatus } from "@/types/saleHandover.types";
import {
  HOLD_STATUS_VARIANTS,
  HOLD_STATUS_LABELS,
  formatHoldAmount,
  formatHoldDate,
  formatUnits,
  isAuditRole,
} from "./holds";

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 10;
const ALL_BRANCHES = "all";

type HoldTab = Extract<HoldStatus, "EXPIRED" | "AUDIT_REVIEW" | "ACTIVE">;

const TAB_LABELS: Record<HoldTab, string> = {
  EXPIRED: "Vencidos",
  AUDIT_REVIEW: "Auditoría",
  ACTIVE: "Activos",
};

export interface HoldsListProps {
  branches: HandoverBranch[];
  onOpenHold: (saleId: number) => void;
}

export function HoldsList({ branches, onOpenHold }: HoldsListProps) {
  const { user } = usePermissions();
  const canSeeAudit = isAuditRole(user?.role);

  const tabs = useMemo(() => {
    const order: HoldTab[] = canSeeAudit
      ? ["EXPIRED", "AUDIT_REVIEW", "ACTIVE"]
      : ["EXPIRED", "ACTIVE"];
    return order.map((value) => ({ value, label: TAB_LABELS[value] }));
  }, [canSeeAudit]);

  const [activeTab, setActiveTab] = useState<HoldTab>("EXPIRED");
  const [branchFilter, setBranchFilter] = useState(ALL_BRANCHES);
  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    "",
    SEARCH_DEBOUNCE_MS,
  );

  const branchId = branchFilter === ALL_BRANCHES ? undefined : Number(branchFilter);

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
  } = usePaginatedList<HoldRow>({
    queryKey: ["sale-handover", "holds", "list"],
    queryFn: (params) =>
      getHolds({
        status: activeTab,
        branchId,
        search: params.search,
        page: params.page,
        limit: params.limit,
      }),
    initialRowsPerPage: PAGE_SIZE,
    extraParams: { status: activeTab, branchId },
  });

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as HoldTab);
    setPage(0);
  };

  const handleBranchChange = (value: string) => {
    setBranchFilter(value);
    setPage(0);
  };

  const isSearching = debouncedSearch.trim().length > 0;

  return (
    <Stack spacing={2}>
      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar por folio o cliente"
        selectFilters={[
          {
            label: "Sucursal",
            value: branchFilter,
            onChange: handleBranchChange,
            options: [
              { label: "Todas las sucursales", value: ALL_BRANCHES },
              ...branches.map((branch) => ({
                label: branch.name,
                value: String(branch.id),
              })),
            ],
          },
        ]}
      />

      {isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Reintentar
            </Button>
          }
        >
          {error?.message ?? "No se pudieron cargar los resguardos."}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack alignItems="center" py={6} spacing={1.5}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Cargando resguardos...
          </Typography>
        </Stack>
      ) : null}

      {!isLoading && !isError && rows.length === 0 ? (
        <Stack alignItems="center" py={6} spacing={0.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            {isSearching
              ? "No hay resguardos que coincidan con la búsqueda"
              : `No hay resguardos ${TAB_LABELS[activeTab].toLowerCase()}`}
          </Typography>
        </Stack>
      ) : null}

      {rows.length > 0 ? (
        <Stack spacing={1.5} sx={{ opacity: isFetching ? 0.6 : 1 }}>
          {rows.map((row) => (
            <HoldCard key={row.saleId} row={row} onOpen={() => onOpenHold(row.saleId)} />
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
    </Stack>
  );
}

function HoldCard({ row, onOpen }: { row: HoldRow; onOpen: () => void }) {
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
            {row.branch.name} · vence {formatHoldDate(row.expiresAt)}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <StatusChip
            size="small"
            variant={HOLD_STATUS_VARIANTS[row.status]}
            label={HOLD_STATUS_LABELS[row.status]}
          />
          <Chip size="small" variant="outlined" label={formatUnits(row.pendingUnits)} />
          <Chip
            size="small"
            variant="outlined"
            label={formatHoldAmount(row.pendingAmount)}
          />
        </Stack>
      </Stack>
    </Box>
  );
}
