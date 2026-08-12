import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Title, TabFilters, TableCrud } from "@/components";
import type { TabOption, SelectFilterOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { getRecoverySheets } from "@/services/recovery-sheets.service";
import type {
  RecoverySheetListItem,
  RecoverySheetOrigin,
  RecoverySheetOriginFilter,
  RecoverySheetStatus,
} from "@/types/recovery-sheets.types";
import {
  RECOVERY_SHEET_ORIGIN_LABELS,
  RECOVERY_SHEET_STATUS_LABELS,
} from "@/types/recovery-sheets.types";
import { formatDateOnly } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const SEARCH_DEBOUNCE_MS = 300;

const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "pendiente" },
  { label: "Programadas", value: "programada" },
  { label: "Recuperadas", value: "recuperada" },
];

const ORIGIN_FILTER_OPTIONS: SelectFilterOption[] = [
  { label: "Todos", value: "all" },
  {
    label: RECOVERY_SHEET_ORIGIN_LABELS.atencion_cliente,
    value: "atencion_cliente",
  },
  { label: RECOVERY_SHEET_ORIGIN_LABELS.cajas, value: "cajas" },
];

const STATUS_CHIP_VARIANTS: Record<RecoverySheetStatus, StatusChipVariant> = {
  pendiente: "pending",
  programada: "info",
  recuperada: "success",
  cancelada: "default",
};

export default function RecoverySheetsPage() {
  const router = useRouter();
  const showError = useSnackbarStore((state) => state.showError);
  const [activeTab, setActiveTab] = useState("all");
  const [originFilter, setOriginFilter] =
    useState<RecoverySheetOriginFilter>("all");

  const statusTabExtra =
    activeTab === "all" ? undefined : { statusTab: activeTab };

  const {
    data: rows,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
    isError,
    error,
  } = usePaginatedList<RecoverySheetListItem>({
    queryKey: ["recovery-sheets", activeTab, originFilter],
    queryFn: (params) =>
      getRecoverySheets({
        ...params,
        originFilter,
        ...statusTabExtra,
      }),
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: { ...statusTabExtra, originFilter },
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    if (isError) {
      showError(
        error?.message ?? "No se pudieron cargar las hojas de recuperación",
      );
    }
  }, [error?.message, isError, showError]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  const handleOriginFilterChange = (value: string) => {
    setOriginFilter(value as RecoverySheetOriginFilter);
    setPage(0);
  };

  const tabs = STATUS_TABS.map((tab) => ({
    ...tab,
    count: tab.value === activeTab ? totalRows : undefined,
  }));

  const columns: Column<RecoverySheetListItem>[] = [
    {
      id: "folio",
      label: "Folio",
      size: "lg",
      truncate: true,
    },
    {
      id: "origin",
      label: "Origen",
      size: "md",
      format: (_value, row) =>
        RECOVERY_SHEET_ORIGIN_LABELS[row.origin as RecoverySheetOrigin],
    },
    {
      id: "articleCode",
      label: "Folio",
      size: "md",
    },
    {
      id: "articleDescription",
      label: "Artículo",
      size: "xl",
      truncate: true,
    },
    {
      id: "createdAt",
      label: "Fecha de creación",
      size: "md",
      format: (_value, row) => formatDateOnly(row.createdAt, "dateLong"),
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: RECOVERY_SHEET_STATUS_LABELS,
      chipVariantMap: STATUS_CHIP_VARIANTS,
    },
  ];

  return (
    <Stack spacing={3}>
      <Title title="Hojas de recuperación" />

      <TabFilters
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder="Buscar"
        selectFilter={{
          label: "Origen",
          value: originFilter,
          options: ORIGIN_FILTER_OPTIONS,
          onChange: handleOriginFilterChange,
        }}
      />

      <TableCrud
        columns={columns}
        rows={rows}
        rowKey="id"
        loading={loading}
        totalRows={totalRows}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => {
          void router.push(`/inventario/hojas-recuperacion/${row.id}`);
        }}
      />
    </Stack>
  );
}
