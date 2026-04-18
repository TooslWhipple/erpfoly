import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { MainLayout, Title, TabFilters, TableCrud } from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import {
  getCreditApplications,
  type CreditApplicationListItem,
  type CreditApplicationListStatusTab,
  type CreditApplicationStatus,
} from "@/services/creditApplicationList.service";
import { Stack } from "@mui/material";
import { formatDateTimeShort, formatDate } from "@/utils/date";

const SEARCH_DEBOUNCE_MS = 300;

type ApplicationTypeCode = "NEW" | "LINE_INCREASE";

const STATUS_TABS: TabOption[] = [
  { label: "Todas", value: "all" },
  { label: "Pendiente", value: "in_review" },
  { label: "Aceptadas", value: "approved" },
  { label: "Rechazadas", value: "rejected" },
];

const STATUS_CHIP_LABELS: Record<CreditApplicationStatus, string> = {
  DRAFT: "Borrador",
  SUBMITTED: "Enviada",
  IN_REVIEW: "Pendiente",
  APPROVED: "Aceptada",
  REJECTED: "Rechazada",
  CANCELLED: "Cancelada",
};

const STATUS_CHIP_VARIANTS: Record<CreditApplicationStatus, StatusChipVariant> = {
  DRAFT: "default",
  SUBMITTED: "default",
  IN_REVIEW: "default",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "error",
};

const TIPO_CONFIG: Record<ApplicationTypeCode, { label: string; color: string }> = {
  NEW: { label: "Nuevo", color: "#22c55e" },
  LINE_INCREASE: { label: "Aumento", color: "#ef4444" },
};

async function approveCreditApplication(id: number): Promise<{ success: boolean }> {
  void id;
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

async function rejectCreditApplication(id: number, reason: string): Promise<{ success: boolean }> {
  void id;
  void reason;
  await new Promise((r) => setTimeout(r, 400));
  return { success: true };
}

export default function SolicitudesCredito() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  const statusTabExtra: { statusTab?: CreditApplicationListStatusTab } | undefined =
    activeTab === "all" ? undefined : { statusTab: activeTab as CreditApplicationListStatusTab };

  const {
    data: solicitudes,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage,
    setRowsPerPage,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<CreditApplicationListItem>({
    queryKey: ["credit-applications", activeTab],
    queryFn: getCreditApplications,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: statusTabExtra,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(0);
  };

  const tabs = STATUS_TABS.map((t) => ({
    ...t,
    count: t.value === activeTab ? totalRows : undefined,
  }));

  const handleEditar = (row: CreditApplicationListItem) => {
    void router.push(`/solicitudes-credito/${row.id}`);
  };

  const handleVerDetalle = (row: CreditApplicationListItem) => {
    void router.push(`/solicitudes-credito/${row.id}/revision`);
  };

  const handleAprobar = async (row: CreditApplicationListItem) => {
    const result = await approveCreditApplication(row.id);
    if (result.success) {
      refetch();
    }
  };

  const handleRechazar = async (row: CreditApplicationListItem) => {
    const result = await rejectCreditApplication(row.id, "Motivo de ejemplo");
    if (result.success) {
      refetch();
    }
  };

  const columns: Column<CreditApplicationListItem>[] = [
    {
      id: "id",
      label: "ID",
      size: "sm",
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: STATUS_CHIP_LABELS,
      chipVariantMap: STATUS_CHIP_VARIANTS,
    },
    {
      id: "fullName",
      label: "Nombre",
      size: "lg",
    },
    {
      id: "phone",
      label: "Teléfono",
      size: "md",
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "requestedAt",
      label: "Solicitado",
      size: "md",
      format: (value) => formatDate(String(value ?? ""), "datetimeShort12h"),
    },
    {
      id: "formattedAddress",
      label: "Domicilio",
      size: "xl",
      truncate: true,
      format: (value) => (value == null || value === "" ? "—" : String(value)),
    },
    {
      id: "applicationTypeCode",
      label: "Tipo",
      size: "sm",
      format: (value) => {
        const normalized = String(value ?? "")
          .trim()
          .toUpperCase();
        const config =
          normalized === "NEW" || normalized === "LINE_INCREASE"
            ? TIPO_CONFIG[normalized]
            : undefined;
        if (!config) {
          return "—";
        }
        return (
          <span style={{ color: config.color, fontWeight: 500 }}>{config.label}</span>
        );
      },
    },
  ];

  const actions: RowAction<CreditApplicationListItem>[] = [
    {
      id: "ver",
      label: "Ver detalle",
      onClick: handleVerDetalle,
    },
    {
      id: "editar",
      label: "Editar",
      onClick: handleEditar,
    },
    {
      id: "aprobar",
      label: "Aprobar",
      onClick: handleAprobar,
      color: "primary",
    },
    {
      id: "rechazar",
      label: "Rechazar",
      onClick: handleRechazar,
      color: "error",
    },
  ];

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Title title="Solicitudes de crédito" />

        <TabFilters
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showSearch
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Buscar por nombre, teléfono o folio"
        />

        <TableCrud
          columns={columns}
          rows={solicitudes}
          actions={actions}
          loading={loading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          emptyMessage="No hay solicitudes de crédito"
        />
      </Stack>
    </MainLayout>
  );
}
