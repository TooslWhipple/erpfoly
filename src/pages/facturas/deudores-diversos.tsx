import { useCallback, useEffect, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { z } from "zod";
import {
  Title,
  TabFilters,
  TableCrud,
  ConfirmModal,
  ModalFormZod,
} from "@/components";
import type { TabOption } from "@/components/TabFilters";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import type { SelectOption } from "@/components/Form";
import { defineFormFields, messages } from "@/forms";
import type { AutocompleteItem } from "@/forms";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { getBranches, type BranchItem } from "@/services/users.service";
import {
  createDiverseDebtor,
  getDiverseDebtors,
  getDiverseDebtorsCatalog,
  updateDiverseDebtor,
} from "@/services/diverse-debtors.service";
import type { DiverseDebtorListItem } from "@/types/diverse-debtors.types";
import {
  DIVERSE_DEBTORS_CREATE,
  DIVERSE_DEBTORS_UPDATE,
} from "@/lib/permissions";

const SEARCH_DEBOUNCE_MS = 300;

type DebtorStatusTab = "all" | "ACTIVE" | "INACTIVE";

const STATUS_TABS: TabOption[] = [
  { label: "Todos", value: "all" },
  { label: "Activos", value: "ACTIVE" },
  { label: "Inactivos", value: "INACTIVE" },
];

const ESTATUS_CHIP_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
  ACTIVE: "success",
  INACTIVE: "error",
};

type DebtorFormValues = {
  employeeNumber: string;
  firstName: string;
  paternalSurname: string;
  maternalSurname: string;
  rfc: string;
  clabe: string;
  branchId: string | number;
  responsibleDebtorIds: (string | number)[];
};

function buildDebtorFormFields(
  debtorItems: AutocompleteItem[],
  branchOptions: SelectOption[],
) {
  return defineFormFields<DebtorFormValues>()([
    {
      name: "employeeNumber",
      schema: z
        .string()
        .min(1, "El no. de empleado es requerido")
        .max(64, messages.string.max(64)),
      label: "No. empleado",
      type: "text",
      placeholder: "Ej. EMP-001",
    },
    {
      name: "firstName",
      schema: z
        .string()
        .min(1, "El nombre es requerido")
        .max(128, messages.string.max(128)),
      label: "Nombre",
      type: "text",
      placeholder: "Ej. Juan",
    },
    {
      name: "paternalSurname",
      schema: z
        .string()
        .min(1, "El apellido paterno es requerido")
        .max(128, messages.string.max(128)),
      label: "Apellido paterno",
      type: "text",
      placeholder: "Ej. Pérez",
    },
    {
      name: "maternalSurname",
      schema: z
        .string()
        .max(128, messages.string.max(128))
        .optional()
        .default(""),
      label: "Apellido materno",
      type: "text",
      placeholder: "Ej. López (opcional)",
    },
    {
      name: "rfc",
      schema: z
        .string()
        .min(12, "El RFC debe tener al menos 12 caracteres")
        .max(13, "El RFC no puede exceder 13 caracteres"),
      label: "RFC",
      type: "text",
      placeholder: "Ej. XAXX010101000",
    },
    {
      name: "clabe",
      schema: z
        .string()
        .regex(/^\d{18}$/, "La CLABE interbancaria debe tener 18 dígitos numéricos"),
      label: "CLABE interbancaria (Transferencias)",
      type: "text",
      placeholder: "18 dígitos numéricos",
    },
    {
      name: "branchId",
      schema: z
        .union([z.string(), z.number()])
        .refine((val) => String(val).trim() !== "", "La sucursal es requerida"),
      label: "Sucursal",
      type: "select",
      placeholder: "Selecciona una sucursal",
      options: branchOptions,
    },
    {
      name: "responsibleDebtorIds",
      schema: z
        .array(z.union([z.string(), z.number()]))
        .optional()
        .default([]),
      label: "Responsables del colaborador (opcional)",
      type: "autocomplete",
      placeholder: "Buscar otras personas del catálogo (opcional)...",
      items: debtorItems,
    },
  ] as const);
}

export default function DeudoresDiversosPage() {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [activeTab, setActiveTab] = useState<DebtorStatusTab>("all");
  const [catalogDebtors, setCatalogDebtors] = useState<DiverseDebtorListItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);

  const loadCatalog = useCallback(() => {
    getDiverseDebtorsCatalog()
      .then((items) => {
        if (Array.isArray(items)) setCatalogDebtors(items);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCatalog();
    getBranches()
      .then((res) => {
        if (res.data) setBranches(res.data);
      })
      .catch(() => {});
  }, [loadCatalog]);

  const [modalState, setModalState] = useState<
    { open: false } | { open: true; debtor?: DiverseDebtorListItem }
  >({ open: false });
  const [saving, setSaving] = useState(false);

  const editingDebtorId = modalState.open ? modalState.debtor?.id : undefined;

  const debtorItems: AutocompleteItem[] = useMemo(
    () =>
      catalogDebtors
        .filter((d) => d.id !== editingDebtorId)
        .map((d) => ({
          id: d.id,
          label: `${d.employeeNumber} - ${d.fullName}`,
        })),
    [catalogDebtors, editingDebtorId],
  );

  const branchOptions: SelectOption[] = useMemo(
    () =>
      branches.map((b) => ({
        value: String(b.id),
        label: b.name,
      })),
    [branches],
  );

  const debtorFormFields = useMemo(
    () => buildDebtorFormFields(debtorItems, branchOptions),
    [debtorItems, branchOptions],
  );

  const listExtraParams = useMemo(() => {
    if (activeTab === "ACTIVE") return { status: "ACTIVE" as const };
    if (activeTab === "INACTIVE") return { status: "INACTIVE" as const };
    return {};
  }, [activeTab]);

  const {
    data: rows,
    total: totalRows,
    page,
    rowsPerPage,
    search: searchValue,
    setPage: handlePageChange,
    setRowsPerPage: handleRowsPerPageChange,
    setSearch,
    isLoading: loading,
    refetch,
  } = usePaginatedList<DiverseDebtorListItem>({
    queryKey: ["diverse-debtors", activeTab],
    queryFn: getDiverseDebtors,
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

  const [confirmState, setConfirmState] = useState<
    | { open: false }
    | {
        open: true;
        debtor: DiverseDebtorListItem;
        target: "ACTIVE" | "INACTIVE";
      }
  >({ open: false });
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOpenCreateModal = () => {
    setModalState({ open: true });
  };

  const handleOpenEditModal = (debtor: DiverseDebtorListItem) => {
    setModalState({ open: true, debtor });
  };

  const handleCloseModal = () => {
    if (saving) return;
    setModalState({ open: false });
  };

  const defaultValues = useMemo<DebtorFormValues>(() => {
    if (modalState.open && modalState.debtor) {
      return {
        employeeNumber: modalState.debtor.employeeNumber,
        firstName: modalState.debtor.firstName,
        paternalSurname: modalState.debtor.paternalSurname,
        maternalSurname: modalState.debtor.maternalSurname ?? "",
        rfc: modalState.debtor.rfc ?? "",
        clabe: modalState.debtor.clabe ?? "",
        branchId: modalState.debtor.branchId ? String(modalState.debtor.branchId) : "",
        responsibleDebtorIds: modalState.debtor.responsibles.map(
          (r) => r.responsibleDebtorId,
        ),
      };
    }
    return {
      employeeNumber: "",
      firstName: "",
      paternalSurname: "",
      maternalSurname: "",
      rfc: "",
      clabe: "",
      branchId: "",
      responsibleDebtorIds: [],
    };
  }, [modalState]);

  const handleSave = async (value: DebtorFormValues) => {
    setSaving(true);
    const editing = modalState.open ? modalState.debtor : undefined;
    const payload = {
      employeeNumber: value.employeeNumber.trim().toUpperCase(),
      firstName: value.firstName.trim(),
      paternalSurname: value.paternalSurname.trim(),
      maternalSurname: value.maternalSurname?.trim() || undefined,
      rfc: value.rfc.trim().toUpperCase(),
      clabe: value.clabe.replace(/\s+/g, "").trim(),
      branchId: value.branchId ? Number(value.branchId) : null,
      responsibleDebtorIds: (value.responsibleDebtorIds ?? []).map((id) =>
        Number(id),
      ),
    };

    const result = editing
      ? await updateDiverseDebtor(editing.id, payload)
      : await createDiverseDebtor(payload);

    setSaving(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setModalState({ open: false });
    showSuccess(
      editing
        ? "Colaborador actualizado correctamente"
        : "Colaborador registrado correctamente",
    );
    refetch();
    loadCatalog();
  };

  const openConfirm = (debtor: DiverseDebtorListItem) => {
    const isActive = debtor.status === "ACTIVE";
    setConfirmState({
      open: true,
      debtor,
      target: isActive ? "INACTIVE" : "ACTIVE",
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({ open: false });
  };

  const handleConfirmAction = async () => {
    if (!confirmState.open) return;
    const { debtor, target } = confirmState;
    setConfirmLoading(true);
    const result = await updateDiverseDebtor(debtor.id, {
      status: target,
    });
    setConfirmLoading(false);

    if (result.error) {
      showError(result.error.message);
      return;
    }

    setConfirmState({ open: false });
    showSuccess(
      target === "INACTIVE"
        ? "Colaborador desactivado correctamente"
        : "Colaborador activado correctamente",
    );
    refetch();
    loadCatalog();
  };

  const columns: Column<DiverseDebtorListItem>[] = [
    {
      id: "employeeNumber",
      label: "No. empleado",
      width: 140,
    },
    {
      id: "fullName",
      label: "Nombre completo",
      width: 220,
    },
    {
      id: "rfc",
      label: "RFC",
      width: 140,
      format: (_, row) => row.rfc || "-",
    },
    {
      id: "clabe",
      label: "CLABE",
      width: 190,
      format: (_, row) => row.clabe || "-",
    },
    {
      id: "branch",
      label: "Sucursal",
      width: 160,
      format: (_, row) => row.branch?.name || "-",
    },
    {
      id: "responsibles",
      label: "Responsables",
      type: "chipGroup",
      chipGroupKey: "fullName",
      chipGroupMaxVisible: 3,
      width: 300,
    },
    {
      id: "status",
      label: "Estatus",
      width: 120,
      size: "sm",
      type: "chip",
      chipLabelMap: ESTATUS_CHIP_LABELS,
      chipVariantMap: ESTATUS_CHIP_VARIANTS,
    },
  ];

  const actions: RowAction<DiverseDebtorListItem>[] = [
    {
      id: "edit",
      label: "Editar",
      onClick: handleOpenEditModal,
      permission: DIVERSE_DEBTORS_UPDATE,
    },
    {
      id: "toggle-status",
      label: (row) => (row.status === "ACTIVE" ? "Desactivar" : "Activar"),
      onClick: openConfirm,
      color: (row) => (row.status === "ACTIVE" ? "error" : "inherit"),
      permission: DIVERSE_DEBTORS_UPDATE,
    },
  ];

  return (
    <Stack direction="column" spacing={3}>
      <Title title="Deudores diversos (Empleados)" />

      <TabFilters
        tabs={STATUS_TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as DebtorStatusTab)}
        showSearch
        searchPlaceholder="Buscar por no. empleado o nombre..."
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        actions={[
          {
            label: "Nuevo colaborador",
            onClick: handleOpenCreateModal,
            variant: "contained",
            color: "primary",
            showIcon: true,
            permission: DIVERSE_DEBTORS_CREATE,
          },
        ]}
      />

      <TableCrud
        columns={columns}
        rows={rows}
        actions={actions}
        loading={loading}
        rowKey="id"
        page={page}
        rowsPerPage={rowsPerPage}
        totalRows={totalRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={handleOpenEditModal}
        emptyMessage="No hay colaboradores registrados en deudores diversos"
      />

      <ModalFormZod
        key={modalState.open ? modalState.debtor?.id ?? "new" : "closed"}
        open={modalState.open}
        onClose={handleCloseModal}
        title={
          modalState.open && modalState.debtor
            ? `Editar: ${modalState.debtor.fullName}`
            : "Nuevo colaborador"
        }
        fields={debtorFormFields}
        defaultValues={defaultValues}
        onSubmit={handleSave}
        loading={saving}
        confirmLabel="Guardar"
        maxWidth="sm"
        fullWidth
        validateOn="change"
        allowInvalidSubmit
      />

      <ConfirmModal
        open={confirmState.open}
        title={
          confirmState.open && confirmState.target === "INACTIVE"
            ? "Desactivar colaborador"
            : "Activar colaborador"
        }
        description={
          confirmState.open
            ? `¿Estás seguro de que deseas ${
                confirmState.target === "INACTIVE" ? "desactivar" : "activar"
              } a "${confirmState.debtor.fullName}"?`
            : ""
        }
        confirmLabel={
          confirmState.open && confirmState.target === "INACTIVE"
            ? "Desactivar"
            : "Activar"
        }
        cancelLabel="Cancelar"
        confirmColor={
          confirmState.open && confirmState.target === "INACTIVE"
            ? "error"
            : "primary"
        }
        loading={confirmLoading}
        onConfirm={handleConfirmAction}
        onClose={closeConfirm}
      />
    </Stack>
  );
}
