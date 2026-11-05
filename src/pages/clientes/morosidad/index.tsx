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
import { useServerSelection } from "@/hooks/useServerSelection";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { CUSTOMER_DELINQUENCY_CREATE } from "@/lib/permissions";
import {
  getDelinquencySummary,
  getDelinquentCustomers,
} from "@/services/delinquency.service";
import { getDelinquencySharedLists } from "@/services/delinquency-shared-list.service";
import type {
  DelinquencySharedListSortField,
  DelinquencySharedListSortOrder,
  DelinquencySharedListSummary,
} from "@/types/delinquency-shared-list.types";
import type {
  DelinquencyPeriod,
  DelinquencySummary,
  DelinquentCustomer,
  GetDelinquentCustomersParams,
} from "@/types/delinquency.types";
import { formatDate, formatDateOnly } from "@/utils/date";
import { toTitleCase } from "@/utils/strings";
import { useSnackbarStore } from "@/store/useSnackbarStore";

type DelinquentCustomerSortField = NonNullable<
  GetDelinquentCustomersParams["sortField"]
>;
type DelinquentCustomerSortOrder = NonNullable<
  GetDelinquentCustomersParams["sortOrder"]
>;

const SEARCH_DEBOUNCE_MS = 300;
const CUSTOMER_ROWS_PER_PAGE = 50;
const CUSTOMER_ROWS_PER_PAGE_OPTIONS = [25, 50, 100];
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [existingListForModal, setExistingListForModal] =
    useState<DelinquencySharedListSummary | null>(null);
  const [sortField, setSortField] =
    useState<DelinquentCustomerSortField>("dueDate");
  const [sortOrder, setSortOrder] =
    useState<DelinquentCustomerSortOrder>("asc");
  const [sharedSortField, setSharedSortField] = useState<
    DelinquencySharedListSortField | undefined
  >(undefined);
  const [sharedSortOrder, setSharedSortOrder] =
    useState<DelinquencySharedListSortOrder>("asc");

  const isSharedLists = activeTab === SHARED_LISTS_TAB;

  const listExtraParams = useMemo((): {
    period?: DelinquencyPeriod;
    sortField: DelinquentCustomerSortField;
    sortOrder: DelinquentCustomerSortOrder;
  } => {
    const params: {
      period?: DelinquencyPeriod;
      sortField: DelinquentCustomerSortField;
      sortOrder: DelinquentCustomerSortOrder;
    } = {
      sortField,
      sortOrder,
    };
    if (activeTab !== "all" && !isSharedLists) {
      params.period = activeTab as DelinquencyPeriod;
    }
    return params;
  }, [activeTab, isSharedLists, sortField, sortOrder]);

  const sharedListExtraParams = useMemo(() => {
    const params: {
      sortField?: DelinquencySharedListSortField;
      sortOrder?: DelinquencySharedListSortOrder;
    } = {};
    if (sharedSortField) {
      params.sortField = sharedSortField;
      params.sortOrder = sharedSortOrder;
    }
    return params;
  }, [sharedSortField, sharedSortOrder]);

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    "",
    SEARCH_DEBOUNCE_MS,
  );

  const {
    data: customers,
    total: customersTotal,
    totalDebtAmount: customersDebtAmount,
    page: customersPage,
    rowsPerPage: customersRowsPerPage,
    setPage: setCustomersPage,
    setRowsPerPage: setCustomersRowsPerPage,
    setSearch: setCustomersSearch,
    isLoading: listLoading,
  } = usePaginatedList<DelinquentCustomer>({
    queryKey: ["clients", "delinquency", "list"],
    queryFn: getDelinquentCustomers,
    initialPage: 0,
    initialRowsPerPage: CUSTOMER_ROWS_PER_PAGE,
    extraParams: listExtraParams,
    enabled: !isSharedLists,
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
    extraParams: sharedListExtraParams,
    enabled: isSharedLists,
  });

  useEffect(() => {
    if (isSharedLists) {
      return;
    }
    setCustomersPage(0);
  }, [sortField, sortOrder, setCustomersPage, isSharedLists]);

  useEffect(() => {
    if (!isSharedLists) {
      return;
    }
    setSharedListsPage(0);
  }, [sharedSortField, sharedSortOrder, setSharedListsPage, isSharedLists]);

  useEffect(() => {
    if (isSharedLists) {
      setSharedListsSearch(debouncedSearch);
      return;
    }
    setCustomersSearch(debouncedSearch);
  }, [debouncedSearch, isSharedLists, setCustomersSearch, setSharedListsSearch]);

  const selection = useServerSelection({
    resetKey: `${activeTab}|${debouncedSearch}`,
    total: customersTotal,
    totalDebtAmount: customersDebtAmount,
    period: listExtraParams.period,
    search: debouncedSearch,
  });

  const selectedRowKeys = useMemo(() => {
    const keys = new Set<number>();
    for (const customer of customers) {
      if (selection.isRowSelected(customer.id)) {
        keys.add(customer.id);
      }
    }
    return keys;
  }, [customers, selection]);

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
      if (value === SHARED_LISTS_TAB) {
        setSharedListsPage(0);
        return;
      }
      setCustomersPage(0);
    },
    [setCustomersPage, setSharedListsPage],
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

  const handleCustomerSelectionChange = useCallback(
    (keys: Set<string | number>) => {
      for (const customer of customers) {
        const selected = keys.has(customer.id);
        if (selected !== selection.isRowSelected(customer.id)) {
          selection.toggleRow(customer.id, customer.debtAmount);
        }
      }
    },
    [customers, selection],
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

  const handleCustomerSortChange = useCallback(
    (field: string, order: DelinquentCustomerSortOrder) => {
      setSortField(field as DelinquentCustomerSortField);
      setSortOrder(order);
    },
    [],
  );

  const handleSharedListSortChange = useCallback(
    (field: string, order: DelinquencySharedListSortOrder) => {
      setSharedSortField(field as DelinquencySharedListSortField);
      setSharedSortOrder(order);
    },
    [],
  );

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
        label: "Cliente",
        size: "xl",
        truncate: true,
        sortable: true,
        format: (value, row) => {
          const displayName = toTitleCase(String(value));
          return (
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
              }}>
              {displayName}
            </Link>
          );
        },
      },
      {
        id: "phone",
        label: "Teléfono",
        size: "md",
        format: (value) => (value ? String(value) : "—"),
      },
      {
        id: "lastPaymentDate",
        label: "Último pago",
        size: "lg",
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
        label: "Morosidad",
        size: "sm",
        type: "chip",
        align: "center",
        chipLabelMap: DELINQUENCY_CHIP_LABELS,
        chipVariantMap: DELINQUENCY_CHIP_VARIANTS,
      },
      {
        id: "debtAmount",
        label: "Deuda",
        type: "currency",
        size: "md",
        align: "right",
        sortable: true,
      },
    ],
    [handleViewCustomer],
  );

  const sharedListColumns: Column<DelinquencySharedListSummary>[] = useMemo(
    () => [
      {
        id: "name",
        label: "Responsable / Gestor",
        size: "xl",
        truncate: true,
        sortable: true,
        format: (value) => {
          const displayName = toTitleCase(String(value));
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: "primary.main" }}>
                {displayName.slice(0, 2).toUpperCase()}
              </Avatar>
              <Typography variant="body2" noWrap title={displayName}>
                {displayName}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: "contactEmail",
        label: "Email",
        size: "lg",
        truncate: true,
        format: (value) => (typeof value === "string" && value ? value : "—"),
      },
      {
        id: "clientCount",
        label: "Clientes compartidos",
        type: "number",
        size: "md",
        align: "right",
        sortable: true,
      },
      {
        id: "shareToken",
        label: "Accesos",
        size: "sm",
        format: (_value, row) => <AccessAvatars emails={row.accessEmails} />,
      },
      {
        id: "totalDebtAmount",
        label: "Valor de deuda",
        type: "currency",
        size: "md",
        align: "right",
        sortable: true,
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
                disabled: selection.selectedCount === 0,
                permission: CUSTOMER_DELINQUENCY_CREATE,
              },
            ]
            : undefined
        }
      />

      {
        (isSharedLists) ?
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
            sortField={sharedSortField}
            sortOrder={sharedSortOrder}
            onSortChange={handleSharedListSortChange}
            emptyMessage="No hay listas compartidas"
          />
          :
          <TableCrud
            columns={customerColumns}
            rows={customers}
            loading={listLoading}
            rowKey="id"
            page={customersPage}
            rowsPerPage={customersRowsPerPage}
            totalRows={customersTotal}
            onPageChange={setCustomersPage}
            onRowsPerPageChange={setCustomersRowsPerPage}
            rowsPerPageOptions={CUSTOMER_ROWS_PER_PAGE_OPTIONS}
            selectable
            selectedRowKeys={selectedRowKeys}
            onSelectedRowKeysChange={handleCustomerSelectionChange}
            headerSelection={{
              checked: selection.isAllSelected,
              indeterminate: selection.isIndeterminate,
              onToggle: selection.toggleAll,
            }}
            onRowClick={(row) => {
              void router.push(`/clientes/${row.id}`);
            }}
            sortField={sortField}
            sortOrder={sortOrder}
            onSortChange={handleCustomerSortChange}
            emptyMessage="No hay clientes con morosidad"
          />
      }

      <ShareDelinquencyListModal
        open={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setExistingListForModal(null);
        }}
        clientCount={selection.selectedCount}
        totalDebt={selection.selectedDebt}
        selectionPayload={selection.payload}
        existingList={existingListForModal}
        onSuccess={handleShareSuccess}
      />
    </Stack>
  );
}
