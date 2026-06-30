import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import { MainLayout, Title, TableCrud, TabFilters } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import { BranchCreateModal } from "@/components/BranchCreateModal/BranchCreateModal";

import {
  getBranches as fetchBranchesApi,
  deleteBranch,
  type Branch,
} from "@/services/branches.service";
import { formatStreetAddressLine } from "@/utils/address";
import {
  CATALOG_BRANCHES_CREATE,
  CATALOG_BRANCHES_DELETE,
  CATALOG_BRANCHES_READ,
  CATALOG_BRANCHES_UPDATE,
} from "@/lib/permissions";

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};
const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

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

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [modalState, setModalState] = useState<
    { open: false } | { open: true; branch?: Branch }
  >({ open: false });

  const fetchBranches = useCallback(async () => {
    setLoading(true);

    const result = await fetchBranchesApi({
      page: page + 1,
      limit: rowsPerPage,
      search: searchValue || undefined,
    });

    setLoading(false);

    if (result.error) {
      setBranches([]);
      setTotalRows(0);
      return;
    }

    if (result.data) {
      setBranches(result.data.rows);
      setTotalRows(result.data.total);
    }
  }, [page, rowsPerPage, searchValue]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    setPage(0);
  }, [searchValue]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

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
    fetchBranches();
  };

  const handleDeleteBranch = async (branch: Branch) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la sucursal "${branch.name}"?`
    );
    if (!confirmed) return;

    const result = await deleteBranch(branch.id);
    if (result.error) {
      console.error("[Sucursales] Error deleting:", result.error.message);
      return;
    }
    fetchBranches();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
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

  const handleViewDetail = (branch: Branch) => {
    router.push(`/catalogos/sucursales/${branch.id}`);
  };

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
      id: "delete",
      label: "Eliminar",
      onClick: handleDeleteBranch,
      color: "error",
      permission: CATALOG_BRANCHES_DELETE,
    },
  ];

  return (
    <MainLayout>
      <Stack direction="column" spacing={3}>
        <Title title="Sucursales" />
        <TabFilters
          tabs={[]}
          activeTab=""
          onTabChange={() => { }}
          showSearch
          searchValue={searchValue}
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
          emptyMessage="No hay sucursales registradas"
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
    </MainLayout>
  );
}
