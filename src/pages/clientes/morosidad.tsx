import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { Link, Stack } from "@mui/material";
import { Title, TabFilters, TableCrud } from "@/components";
import { StatsCardGroup } from "@/components/StatsCard";
import type { StatsCardData } from "@/components/StatsCard";
import type { TabOption } from "@/components/TabFilters";
import type { Column, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getDelinquencySummary,
  getDelinquentCustomers,
} from "@/services/delinquency.service";
import type {
  DelinquencyPeriod,
  DelinquencySummary,
  DelinquentCustomer,
} from "@/types/delinquency.types";
import { formatDate, formatDateOnly } from "@/utils/date";

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
  const [activeTab, setActiveTab] = useState("all");
  const isSharedLists = activeTab === SHARED_LISTS_TAB;

  const listExtraParams = useMemo(() => {
    if (activeTab === "all" || isSharedLists) {
      return {};
    }
    return { period: activeTab as DelinquencyPeriod };
  }, [activeTab, isSharedLists]);

  const {
    data: customers,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage: handleRowsPerPageChange,
    setSearch,
    isLoading: listLoading,
  } = usePaginatedList<DelinquentCustomer>({
    queryKey: ["clients", "delinquency", "list"],
    queryFn: getDelinquentCustomers,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
    enabled: !isSharedLists,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

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
      setPage(0);
    },
    [setPage],
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

  const columns: Column<DelinquentCustomer>[] = useMemo(
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
      />

      <TableCrud
        columns={columns}
        rows={isSharedLists ? [] : customers}
        loading={isSharedLists ? false : listLoading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={isSharedLists ? 0 : totalRows}
        onPageChange={setPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={(row) => {
          void router.push(`/clientes/${row.id}`);
        }}
        emptyMessage={
          isSharedLists ? "Próximamente" : "No hay clientes con morosidad"
        }
      />
    </Stack>
  );
}
