import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Link, Stack, Typography } from "@mui/material";
import { Link as LinkIcon } from "@mui/icons-material";
import { Title, TabFilters, TableCrud } from "@/components";
import { ShareDelinquencyListModal } from "@/components/Delinquency";
import { AccessAvatars } from "@/components/Delinquency/AccessAvatars";
import { StatsCardGroup } from "@/components/StatsCard";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { CUSTOMER_DELINQUENCY_CREATE } from "@/lib/permissions";
import {
  getDelinquencySummary,
  getDelinquentCustomers,
} from "@/services/delinquency.service";
import { getDelinquencySharedLists } from "@/services/delinquency-shared-list.service";
import type { DelinquencySharedListSummary } from "@/types/delinquency-shared-list.types";
import type {
  DelinquencyPeriod,
  DelinquencySummary,
  DelinquentCustomer,
} from "@/types/delinquency.types";
import { formatDate, formatDateOnly } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const SEARCH_DEBOUNCE_MS = 300;
const SHARED_LISTS_TAB = "shared_lists";
const DATE_FORMAT = "D [de] MMMM, YYYY";

const TABS: TabOption[] = [
  { label: "Todos", value: "all" },
  { label: "1 día", value: "1_day" },
  { label: "1 semana", value: "1_week" },
  { label: "1 mes", value: "1_month" },
  { label: "2 meses", value: "2_months" },
  { label: "Listas compartidas", value: SHARED_LISTS_TAB },
];

const DELINQUENCY_CHIP_LABELS: Record<string, string> = {
  "1_day": "1 día",
  "1_week": "1 semana",
  "1_month": "1 mes",
  "2_months": "2 meses",
};

const DELINQUENCY_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  "1_day": "default",
  "1_week": "error",
  "1_month": "error",
  "2_months": "error",
};

function toComparison(
  bucket: DelinquencySummary["oneDay"],
  hasComparison: boolean,
): StatsCardData["comparison"] {
  if (!hasComparison || bucket.change === 0) {
    return undefined;
  }
  return {
    value: bucket.change,
    type: bucket.changeType,
    period: "el mes anterior",
  };
}

export default function ClientesMorosidad() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const [activeTab, setActiveTab] = useState("all");
  const [selectedClientIds, setSelectedClientIds] = useState<Set<number>>(new Set());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [existingListForModal, setExistingListForModal] =
    useState<DelinquencySharedListSummary | null>(null);

  const isSharedLists = activeTab === SHARED_LISTS_TAB;

  const listExtraParams = useMemo(() => {
    if (activeTab === "all" || isSharedLists) {
      return {};
    }
    return { period: activeTab as DelinquencyPeriod };
  }, [activeTab, isSharedLists]);

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    "",
    SEARCH_DEBOUNCE_MS,
  );

  const {
    data: customers,
    isLoading: listLoading,
  } = useQuery({
    queryKey: [
      "clients",
      "delinquency",
      "list",
      "all",
      listExtraParams,
      debouncedSearch,
    ],
    enabled: !isSharedLists,
    queryFn: async () => {
      const countResult = await getDelinquentCustomers({
        page: 1,
        limit: 1,
        search: debouncedSearch || undefined,
        ...listExtraParams,
      });
      if (countResult.error) {
        throw new Error(countResult.error.message);
      }
      const total = countResult.data?.total ?? 0;
      if (total === 0) {
        return [] as DelinquentCustomer[];
      }

      const fullResult = await getDelinquentCustomers({
        page: 1,
        limit: total,
        search: debouncedSearch || undefined,
        ...listExtraParams,
      });
      if (fullResult.error) {
        throw new Error(fullResult.error.message);
      }
      return fullResult.data?.rows ?? [];
    },
  });

  const {
    data: sharedLists,
    total: sharedListsTotal,
    page: sharedListsPage,
    rowsPerPage: sharedListsRowsPerPage,
    setPage: setSharedListsPage,
    setRowsPerPage: setSharedListsRowsPerPage,
    setSearch: setSharedListsSearch,
    isLoading: sharedListsLoading,
  } = usePaginatedList<DelinquencySharedListSummary>({
    queryKey: ["clients", "delinquency", "shared-lists"],
    queryFn: getDelinquencySharedLists,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    enabled: isSharedLists,
  });

  useEffect(() => {
    if (isSharedLists) {
      setSharedListsSearch(debouncedSearch);
    }
  }, [debouncedSearch, isSharedLists, setSharedListsSearch]);

  const { data: summary } = useQuery({
    queryKey: ["clients", "delinquency", "summary"],
    queryFn: async () => {
      const result = await getDelinquencySummary();
      if (result.error) {
        throw new Error(result.error.message);
      }
      if (result.data == null) {
        throw new Error("No data");
      }
      return result.data;
    },
  });

  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value);
      setSelectedClientIds(new Set());
      if (value === SHARED_LISTS_TAB) {
        setSharedListsPage(0);
      }
    },
    [setSharedListsPage],
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
    },
    [setSearchInput],
  );

  const handleViewCustomer = useCallback(
    (customer: DelinquentCustomer) => {
      void router.push(`/clientes/${customer.id}`);
    },
    [router],
  );

  const selectedCustomers = useMemo(
    () => (customers ?? []).filter((customer) => selectedClientIds.has(customer.id)),
    [customers, selectedClientIds],
  );

  const handleOpenShareModal = useCallback(() => {
    setExistingListForModal(null);
    setShareModalOpen(true);
  }, []);

  const handleOpenSharedListModal = useCallback((list: DelinquencySharedListSummary) => {
    setExistingListForModal(list);
    setShareModalOpen(true);
  }, []);

  const handleCopySharedListLink = useCallback(
    async (list: DelinquencySharedListSummary) => {
      try {
        await navigator.clipboard.writeText(list.shareUrl);
        showSuccess("Enlace copiado al portapapeles");
      } catch {
        showSuccess("No se pudo copiar el enlace");
      }
    },
    [showSuccess],
  );

  const handleViewSharedListDetail = useCallback(
    (list: DelinquencySharedListSummary) => {
      void router.push(`/clientes/morosidad/listas/${list.id}`);
    },
    [router],
  );

  const handleShareSuccess = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["clients", "delinquency", "shared-lists"] });
  }, [queryClient]);

  const statsCards: StatsCardData[] = summary
    ? [
        {
          id: "one_day",
          label: "1 día",
          value: summary.oneDay.count,
          comparison: toComparison(summary.oneDay, summary.hasComparison),
        },
        {
          id: "one_week",
          label: "1 semana",
          value: summary.oneWeek.count,
          comparison: toComparison(summary.oneWeek, summary.hasComparison),
        },
        {
          id: "one_month",
          label: "1 mes",
          value: summary.oneMonth.count,
          comparison: toComparison(summary.oneMonth, summary.hasComparison),
        },
        {
          id: "two_months",
          label: "2 meses",
          value: summary.twoMonths.count,
          comparison: toComparison(summary.twoMonths, summary.hasComparison),
        },
      ]
    : [];

  const customerColumns: Column<DelinquentCustomer>[] = useMemo(
    () => [
      {
        id: "fullName",
        label: "CLIENTE",
        size: "xl",
        format: (value, row) => (
          <Link
            component="button"
            onClick={(event) => {
              event.stopPropagation();
              handleViewCustomer(row);
            }}
            sx={{
              color: "text.primary",
              textDecoration: "underline",
              textDecorationColor: "text.secondary",
              fontWeight: 400,
              cursor: "pointer",
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            {String(value)}
          </Link>
        ),
      },
      {
        id: "phone",
        label: "TELÉFONO",
        size: "md",
        format: (value) => (value ? String(value) : "—"),
      },
      {
        id: "lastPaymentDate",
        label: "ÚLTIMO PAGO",
        size: "md",
        format: (value) =>
          value ? formatDate(value, DATE_FORMAT) : "—",
      },
      {
        id: "dueDate",
        label: "Fecha de vencimiento",
        size: "lg",
        format: (value) => formatDateOnly(value, DATE_FORMAT),
      },
      {
        id: "delinquencyPeriod",
        label: "MOROSIDAD",
        size: "sm",
        type: "chip",
        align: "center",
        chipLabelMap: DELINQUENCY_CHIP_LABELS,
        chipVariantMap: DELINQUENCY_CHIP_VARIANTS,
      },
      {
        id: "debtAmount",
        label: "DEUDA",
        type: "currency",
        size: "md",
        align: "right",
      },
    ],
    [handleViewCustomer],
  );

  const sharedListColumns: Column<DelinquencySharedListSummary>[] = useMemo(
    () => [
      {
        id: "name",
        label: "CLIENTE",
        size: "xl",
        truncate: true,
        format: (value) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: "primary.main" }}>
              {String(value).slice(0, 2).toUpperCase()}
            </Avatar>
            <Typography variant="body2" noWrap title={String(value)}>
              {String(value)}
            </Typography>
          </Stack>
        ),
      },
      {
        id: "contactEmail",
        label: "EMAIL",
        size: "lg",
        truncate: true,
        format: (value) => (typeof value === "string" && value ? value : "—"),
      },
      {
        id: "clientCount",
        label: "CLIENTES COMPARTIDOS",
        type: "number",
        size: "md",
        align: "right",
      },
      {
        id: "shareToken",
        label: "ACCESO",
        size: "sm",
        format: (_value, row) => <AccessAvatars emails={row.accessEmails} />,
      },
      {
        id: "totalDebtAmount",
        label: "VALOR DE DEUDA",
        type: "currency",
        size: "md",
        align: "right",
      },
    ],
    [],
  );

  const sharedListActions: RowAction<DelinquencySharedListSummary>[] = useMemo(
    () => [
      {
        id: "view-detail",
        label: "Ver detalle",
        onClick: (row) => handleViewSharedListDetail(row),
      },
      {
        id: "manage-access",
        label: "Ver accesos",
        onClick: (row) => handleOpenSharedListModal(row),
      },
      {
        id: "copy-link",
        label: "Copiar link",
        icon: <LinkIcon fontSize="small" />,
        onClick: (row) => void handleCopySharedListLink(row),
      },
    ],
    [
      handleCopySharedListLink,
      handleOpenSharedListModal,
      handleViewSharedListDetail,
    ],
  );

  return (
    <Stack spacing={3}>
      <Title title="Morosidad" />

      {summary && <StatsCardGroup cards={statsCards} columns={4} />}

      <TabFilters
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showSearch
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        actions={
          !isSharedLists
            ? [
                {
                  label: "Compartir",
                  onClick: handleOpenShareModal,
                  disabled: selectedClientIds.size === 0,
                  permission: CUSTOMER_DELINQUENCY_CREATE,
                },
              ]
            : undefined
        }
      />

      {isSharedLists ? (
        <TableCrud
          columns={sharedListColumns}
          rows={sharedLists}
          loading={sharedListsLoading}
          rowKey="id"
          page={sharedListsPage}
          rowsPerPage={sharedListsRowsPerPage}
          totalRows={sharedListsTotal}
          onPageChange={setSharedListsPage}
          onRowsPerPageChange={setSharedListsRowsPerPage}
          actions={sharedListActions}
          onRowClick={handleViewSharedListDetail}
          emptyMessage="No hay listas compartidas"
        />
      ) : (
        <TableCrud
          columns={customerColumns}
          rows={customers ?? []}
          loading={listLoading}
          rowKey="id"
          hidePagination
          selectable
          selectedRowKeys={selectedClientIds}
          onSelectedRowKeysChange={(keys) => {
            setSelectedClientIds(new Set([...keys].map(Number)));
          }}
          onRowClick={(row) => {
            void router.push(`/clientes/${row.id}`);
          }}
          emptyMessage="No hay clientes con morosidad"
        />
      )}

      <ShareDelinquencyListModal
        open={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setExistingListForModal(null);
        }}
        selectedCustomers={selectedCustomers}
        existingList={existingListForModal}
        onSuccess={handleShareSuccess}
      />
    </Stack>
  );
}
