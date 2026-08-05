import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import { Title, TableCrud, TabFilters, ConfirmModal } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { BranchCreateModal } from "@/components/BranchCreateModal/BranchCreateModal";

import {
  getBranches as fetchBranchesApi,
  updateBranch,
  type Branch,
} from "@/services/branches.service";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { formatStreetAddressLine } from "@/utils/address";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  CATALOG_BRANCHES_CREATE,
  CATALOG_BRANCHES_READ,
  CATALOG_BRANCHES_UPDATE,
} from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};
const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

type BranchStatusTab = "all" | "active" | "inactive";

const STATUS_TABS: { value: BranchStatusTab; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activas" },
  { value: "inactive", label: "Inactivas" },
];

function formatBranchAddress(branch: Branch) {
  const streetLine = formatStreetAddressLine({
    street: branch.street,
    externalNumber: branch.externalNumber,
    internalNumber: branch.internalNumber,
  });
  const localityLine = [branch.neighborhoodName, branch.municipality]
    .map((value) => value?.trim() ?? "")
    .filter((value) => value.length > 0)
    .join(", ");
  const regionLine = [branch.state, branch.postalCode]
    .map((value) => value?.trim() ?? "")
    .filter((value) => value.length > 0)
    .join(", ");

  const lines = [streetLine, localityLine, regionLine].filter((line) => line.length > 0);

  if (lines.length === 0) {
    return <Typography variant="body2" color="text.secondary">Sin domicilio</Typography>
  }

  return <Typography variant="body1">{lines.join(", ")}</Typography>
}

export default function Sucursales() {
  const router = useRouter();
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<BranchStatusTab>("all");

  const listExtraParams = useMemo(() => {
    if (activeTab === "active") return { status: "ACTIVE" as const };
    if (activeTab === "inactive") return { status: "INACTIVE" as const };
    return {};
  }, [activeTab]);

  const {
    data: branches,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage: handlePageChange,
    setRowsPerPage: handleRowsPerPageChange,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<Branch>({
    queryKey: ["branches"],
    queryFn: fetchBranchesApi,
    initialPage: 0,
    initialRowsPerPage: 10,
    initialSearch: "",
    extraParams: listExtraParams,
  });

  const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
    searchValue,
    SEARCH_DEBOUNCE_MS,
  );

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  useEffect(() => {
    handlePageChange(0);
  }, [activeTab, handlePageChange]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as BranchStatusTab);
  };

  const [modalState, setModalState] = useState<
    { open: false } | { open: true; branch?: Branch }
  >({ open: false });

  const handleOpenCreateModal = () => {
    setModalState({ open: true });
  };

  const handleOpenEditModal = (branch: Branch) => {
    setModalState({ open: true, branch });
  };

  const handleCloseModal = () => {
    setModalState({ open: false });
  };

  const handleModalSuccess = () => {
    refetch();
  };

  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | { open: true; branch: Branch; target: "ACTIVE" | "INACTIVE" }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const openConfirm = (branch: Branch) => {
    const isActive = branch.status === "ACTIVE";
    setConfirmState({
      open: true,
      branch,
      target: isActive ? "INACTIVE" : "ACTIVE",
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;
    const { branch, target } = confirmState;
    setConfirmLoading(true);
    const result = await updateBranch(branch.id, { status: target });
    setConfirmLoading(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    setConfirmState({ open: false });
    showSuccess(
      target === "ACTIVE"
        ? "Sucursal activada correctamente"
        : "Sucursal desactivada correctamente",
    );
    refetch();
  };

  const handleViewDetail = (branch: Branch) => {
    router.push(`/catalogos/sucursales/${branch.id}`);
  };

  const columns: Column<Branch>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      maxSize: "xs",
      idPadding: 2,
    },
    {
      id: "name",
      label: "Nombre",
      size: "md",
    },
    {
      id: "zoneName",
      label: "Zona",
      size: "sm",
      format: (value) => (
        <Typography variant="body2" color={value ? "text.primary" : "text.secondary"}>
          {(value as string | null) ?? "Sin zona"}
        </Typography>
      ),
    },
    {
      id: "address",
      label: "Domicilio",
      size: "xl",
      format: (_value, row) => formatBranchAddress(row),
    },
    {
      id: "status",
      label: "Estatus",
      size: "sm",
      type: "chip",
      chipLabelMap: ESTATUS_CHIP_LABELS,
      chipVariantMap: ESTATUS_CHIP_VARIANTS,
    },
    {
      id: "createdAt",
      label: "Fecha registro",
      type: "date",
      size: "sm",
    },
    {
      id: "updatedAt",
      label: "Últ. actualización",
      type: "date",
      size: "sm",
    },
  ];

  const actions: RowAction<Branch>[] = [
    {
      id: "view",
      label: "Ver detalle",
      onClick: handleViewDetail,
      permission: CATALOG_BRANCHES_READ,
    },
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
      permission: CATALOG_BRANCHES_UPDATE,
    },
    {
      id: "toggle-status",
      label: (row) => (row.status === "ACTIVE" ? "Desactivar" : "Activar"),
      onClick: openConfirm,
      color: (row) => (row.status === "ACTIVE" ? "error" : "primary"),
      permission: CATALOG_BRANCHES_UPDATE,
    },
  ];

  return (
    <>
      <Stack direction="column" spacing={3}>
        <Title title="Sucursales" />
        <TabFilters
          tabs={STATUS_TABS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          showSearch
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          actions={[
            {
              label: "Nuevo",
              onClick: handleOpenCreateModal,
              variant: "contained",
              permission: CATALOG_BRANCHES_CREATE,
            }
          ]}
        />

        <TableCrud
          columns={columns}
          rows={branches}
          actions={actions}
          loading={loading}
          rowKey="id"
          page={page}
          rowsPerPage={rowsPerPage}
          totalRows={totalRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRowClick={handleViewDetail}
          emptyMessage={
            activeTab === "inactive"
              ? "No hay sucursales inactivas"
              : activeTab === "active"
                ? "No hay sucursales activas"
                : "No hay sucursales registradas"
          }
        />
      </Stack>

      <BranchCreateModal
        key={
          modalState.open
            ? modalState.branch
              ? `edit-${modalState.branch.id}`
              : "new"
            : "closed"
        }
        open={modalState.open}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        branch={modalState.open ? modalState.branch : undefined}
      />

      <ConfirmModal
        open={confirmState.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmState.open && confirmState.target === "ACTIVE"
            ? "Activar sucursal"
            : "Desactivar sucursal"
        }
        description={
          confirmState.open ? (
            <>
              ¿Estás seguro de {confirmState.target === "ACTIVE" ? "activar" : "desactivar"} la
              sucursal{" "}
              <strong>{confirmState.branch.name}</strong>?
            </>
          ) : null
        }
        confirmLabel={
          confirmState.open && confirmState.target === "ACTIVE"
            ? "Activar"
            : "Desactivar"
        }
        confirmColor={
          confirmState.open && confirmState.target === "ACTIVE" ? "success" : "error"
        }
        loading={confirmLoading}
      />
    </>
  );
}
