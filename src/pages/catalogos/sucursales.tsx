import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { InputAdornment } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, ModalForm } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { FormFieldConfig } from "@/components/Form";
import {
  HeaderContainer,
  ControlsContainer,
  SearchInput,
  CreateButton,
  SearchIconStyled,
} from "./catalogos.styledComponents";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Branch {
  id: number;
  name: string;
}

interface GetBranchesParams {
  page: number;
  limit: number;
  search?: string;
}

interface GetBranchesResponse {
  data: Branch[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================================
// MOCK DATA - Realistic branch locations
// ============================================================================

const DUMMY_BRANCHES: Branch[] = [
  { id: 1, name: "Foly Muebles Matriz" },
  { id: 2, name: "Foly Muebles Tampico Centro" },
  { id: 3, name: "Foly Muebles Tampico Aeropuerto" },
  { id: 4, name: "Foly Muebles Avenida Monterrey" },
  { id: 5, name: "Foly Muebles Ejército Mexicano" },
  { id: 6, name: "Foly Muebles Altamira" },
  { id: 7, name: "Foly Muebles Bodega Tampico" },
  { id: 8, name: "Foly Muebles San Luis Potosi Carranza" },
  { id: 9, name: "Foly Muebles San Luis Potosi Soledad" },
  { id: 10, name: "Foly Muebles Poza Rica" },
  { id: 11, name: "Foly Muebles Pánuco" },
  { id: 12, name: "Foly Muebles Veracruz Puerto" },
  { id: 13, name: "Foly Muebles Coatzacoalcos" },
  { id: 14, name: "Foly Muebles Ciudad Victoria" },
  { id: 15, name: "Foly Muebles Reynosa" },
  { id: 16, name: "Foly Muebles Matamoros" },
  { id: 17, name: "Foly Muebles Nuevo Laredo" },
  { id: 18, name: "Foly Muebles Tuxpan" },
  { id: 19, name: "Foly Muebles Xalapa" },
  { id: 20, name: "Foly Muebles Córdoba" },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getBranches(
  params: GetBranchesParams
): Promise<GetBranchesResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filteredData = [...DUMMY_BRANCHES];

  // Filter by search
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filteredData = filteredData.filter((b) =>
      b.name.toLowerCase().includes(searchLower)
    );
  }

  const total = filteredData.length;
  const start = params.page * params.limit;
  const end = start + params.limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    total,
    page: params.page,
    limit: params.limit,
  };
}

async function createBranch(data: Omit<Branch, "id">): Promise<Branch> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const newBranch: Branch = {
    id: Date.now(),
    ...data,
  };
  console.log("[API] Created branch:", newBranch);
  return newBranch;
}

async function deleteBranch(id: number): Promise<{ success: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  console.log("[API] Deleted branch:", id);
  return { success: true };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Sucursales() {
  const router = useRouter();

  // State management
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch branches
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBranches({
        page,
        limit: rowsPerPage,
        search: searchValue,
      });
      setBranches(response.data);
      setTotalRows(response.total);
    } catch (err) {
      console.error("[Sucursales] Error fetching:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchValue]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    setPage(0);
  }, [searchValue]);

  // Form fields configuration
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

  // Event handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
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
    try {
      if (editingBranch) {
        // Update existing branch
        console.log("[Sucursales] Updating branch:", editingBranch.id, data);
        // await updateBranch(editingBranch.id, data);
      } else {
        // Create new branch
        await createBranch({ name: data.name as string });
      }
      handleCloseModal();
      fetchBranches();
    } catch (err) {
      console.error("[Sucursales] Error saving:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async (branch: Branch) => {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la sucursal "${branch.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteBranch(branch.id);
      fetchBranches();
    } catch (err) {
      console.error("[Sucursales] Error deleting:", err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // Table columns
  const columns: Column<Branch>[] = [
    {
      id: "id",
      label: "ID",
      type: "id",
      size: "xs",
      idPadding: 2,
    },
    {
      id: "name",
      label: "Nombre",
      size: "xl",
    },
  ];

  // Navigation handler
  const handleViewDiscounts = (branch: Branch) => {
    router.push(`/catalogos/sucursales/${branch.id}`);
  };

  // Row actions
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
      <HeaderContainer>
        <Title title="Sucursales" />
        <ControlsContainer>
          <SearchInput
            size="small"
            placeholder="Buscar"
            value={searchValue}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIconStyled />
                </InputAdornment>
              ),
            }}
          />
          <CreateButton
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
          >
            Nueva sucursal
          </CreateButton>
        </ControlsContainer>
      </HeaderContainer>

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

      {/* Create/Edit Branch Modal */}
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
