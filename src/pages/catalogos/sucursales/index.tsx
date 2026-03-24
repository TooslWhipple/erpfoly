import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { InputAdornment, Stack } from "@mui/material";
import { MainLayout, Title, TableCrud, ModalForm, TabFilters } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import type { FormFieldConfig } from "@/components/Form";

import {
  getBranches as fetchBranchesApi,
  createBranch,
  updateBranch,
  deleteBranch,
  type Branch,
} from "@/services/branches.service";

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};
const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

export default function Sucursales() {
  const router = useRouter();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);

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

  const branchFormFields: FormFieldConfig[] = [
    {
      name: "name",
      label: "Nombre de la sucursal",
      type: "text",
      placeholder: "Ej. Foly Muebles Centro",
      validation: {
        required: true,
        minLength: 3,
        maxLength: 64,
      },
      autoFocus: true,
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleOpenCreateModal = () => {
    setEditingBranch(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBranch(null);
  };

  const handleSaveBranch = async (data: Record<string, unknown>) => {
    setSaving(true);
    if (editingBranch) {
      const result = await updateBranch(editingBranch.id, {
        name: data.name as string,
      });
      setSaving(false);
      if (result.error) {
        console.error("[Sucursales] Error updating:", result.error.message);
        return;
      }
    } else {
      const result = await createBranch({ name: data.name as string });
      setSaving(false);
      if (result.error) {
        console.error("[Sucursales] Error creating:", result.error.message);
        return;
      }
    }
    handleCloseModal();
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
      size: "xl",
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

  const handleViewDiscounts = (branch: Branch) => {
    router.push(`/catalogos/sucursales/${branch.id}`);
  };

  const actions: RowAction<Branch>[] = [
    {
      id: "discounts",
      label: "Ver descuentos",
      onClick: handleViewDiscounts,
    },
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
    },
    {
      id: "delete",
      label: "Eliminar",
      onClick: handleDeleteBranch,
      color: "error",
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
          searchPlaceholder="Buscar"
          actions={[
            {
              label: "Nuevo",
              onClick: handleOpenCreateModal,
              variant: "contained"
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
          onRowClick={handleViewDiscounts}
          emptyMessage="No hay sucursales registradas"
        />
      </Stack>

      <ModalForm
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingBranch ? "Editar sucursal" : "Nueva sucursal"}
        fields={branchFormFields}
        onConfirm={handleSaveBranch}
        loading={saving}
        initialValues={editingBranch ? { name: editingBranch.name } : undefined}
        confirmLabel="Guardar"
        cancelLabel="Cancelar"
        maxWidth="xs"
      />
    </MainLayout>
  );
}
