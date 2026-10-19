import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { Gavel } from "lucide-react";
import { Title, TabFilters, TableCrud, StatusChip } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabOption } from "@/components/TabFilters";
import { ResolveIncidentModal, useTransferActionRunner } from "@/components/TransferActions";
import { TRASPASOS_INCIDENTS_UPDATE } from "@/lib/permissions";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { usePaginatedList, type PaginatedListParams } from "@/hooks/usePaginatedList";
import { getTransferIncidents, resolveTransferIncident } from "@/services/transfers.service";
import type { TransferIncidentStatus, TransferIncidentView } from "@/types/transfers.types";
import { formatDate } from "@/utils/date";
import { INCIDENT_STATUS_LABELS, INCIDENT_STATUS_VARIANTS } from "@/utils/transfers";

const ALL_TAB = "all";
const DEFAULT_TAB: TransferIncidentStatus = "IN_REVIEW";

const TABS: TabOption[] = [
  { label: "En revisión", value: "IN_REVIEW" },
  { label: "Abiertas", value: "OPEN" },
  { label: "Resueltas", value: "RESOLVED" },
  { label: "Retiradas", value: "CANCELLED" },
  { label: "Todas", value: ALL_TAB },
];

const INCIDENTS_QUERY_KEY = ["transfer-incidents"];
const SEARCH_DEBOUNCE_MS = 300;

export default function TraspasosIncidenciasPage() {
  const [activeTab, setActiveTab] = useState<string>(DEFAULT_TAB);
  const [selected, setSelected] = useState<TransferIncidentView | null>(null);

  const status = activeTab === ALL_TAB ? undefined : (activeTab as TransferIncidentStatus);

  const {
    data: incidents,
    total,
    page,
    rowsPerPage,
    search,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading,
    refetch,
  } = usePaginatedList<TransferIncidentView>({
    queryKey: INCIDENTS_QUERY_KEY,
    queryFn: ({ page: apiPage, limit, search: term }: PaginatedListParams) =>
      getTransferIncidents({ page: apiPage, limit, search: term, status }),
    extraParams: { status: activeTab },
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(search, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(0);
  };

  const { run, busy } = useTransferActionRunner(() => {
    refetch();
  });

  const columns: Column<TransferIncidentView>[] = [
    { id: "id", label: "Incidencia", size: "sm" },
    {
      id: "order",
      label: "Traspaso",
      size: "md",
      format: (value) => (value as TransferIncidentView["order"]).folio,
    },
    {
      id: "origin",
      label: "Origen",
      size: "lg",
      truncate: true,
      format: (_value, row) => row.order.origin_branch?.name ?? "—",
    },
    {
      id: "destination",
      label: "Destino",
      size: "lg",
      truncate: true,
      format: (_value, row) => row.order.branch?.name ?? "—",
    },
    { id: "description", label: "Descripción", size: "xl", truncate: true },
    {
      id: "created_at",
      label: "Fecha",
      size: "lg",
      format: (value) => formatDate(String(value), "datetimeShort12h"),
    },
    {
      id: "status",
      label: "Estatus",
      size: "md",
      format: (value) => {
        const status = value as TransferIncidentStatus;
        return (
          <StatusChip
            size="small"
            label={INCIDENT_STATUS_LABELS[status]}
            variant={INCIDENT_STATUS_VARIANTS[status]}
          />
        );
      },
    },
  ];

  const actions: RowAction<TransferIncidentView>[] = [
    {
      id: "resolve",
      label: "Resolver",
      icon: <Gavel size={16} />,
      onClick: setSelected,
      permission: TRASPASOS_INCIDENTS_UPDATE,
      hidden: (row) => !row.allowed_actions.includes("resolve"),
    },
  ];

  return (
    <>
      <Stack direction="column" spacing={3}>
        <Title title="Incidencias de traspaso" />
        <TabFilters
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
        />
        <TableCrud
          columns={columns}
          rows={incidents}
          actions={actions}
          loading={isLoading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={total}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          emptyMessage="No hay incidencias"
        />
      </Stack>

      {selected && (
        <ResolveIncidentModal
          incident={selected}
          loading={busy}
          onClose={() => setSelected(null)}
          onSubmit={async (payload) => {
            if (await run(() => resolveTransferIncident(selected.id, payload), "Incidencia resuelta.")) {
              setSelected(null);
            }
          }}
        />
      )}
    </>
  );
}
