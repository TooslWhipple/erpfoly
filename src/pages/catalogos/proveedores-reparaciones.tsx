import { useState, useEffect, useMemo } from "react";
import {
    Box,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, FormTextField, Tabs, ModalForm, MultiSelectAutocomplete } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import type { TabItem } from "@/components/Tabs";
import type { FormFieldConfig } from "@/components/Form";
import type { SelectableItem } from "@/components/MultiSelectChips";
import {
    HeaderContainer,
    ControlsContainer,
    SearchInput,
    CreateButton,
    SearchIconStyled,
} from "@/styles/catalogos/catalogos.styledComponents";
import {
    TabsWrapper,
    SettingsCard,
    SectionTitle,
    FieldContainer,
    SaveButton,
    HelperNote,
} from "@/styles/catalogos/proveedores-reparaciones.styles";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useQuery } from "@tanstack/react-query";
import {
    getRepairSuppliers,
    createRepairSupplier,
    updateRepairSupplier,
    deleteRepairSupplier,
} from "@/services/repair-suppliers.service";
import type { RepairSupplier } from "@/services/repair-suppliers.service";
import { getDepartments } from "@/services/departments.service";
import type { Department } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const SEARCH_DEBOUNCE_MS = 300;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProveedoresReparaciones() {
    const showSnackbar = useSnackbarStore((s) => s.showSuccess);
    const showError = useSnackbarStore((s) => s.showError);

    const [activeTab, setActiveTab] = useState("suppliers");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<RepairSupplier | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<(string | number)[]>([]);
    const [hourlyCost, setHourlyCost] = useState("720.00");
    const [savingSettings, setSavingSettings] = useState(false);

    const {
        data: suppliers,
        total: totalRows,
        page,
        rowsPerPage,
        search: searchValue,
        setPage,
        setRowsPerPage,
        setSearch,
        isLoading: loading,
        refetch,
    } = usePaginatedList<RepairSupplier>({
        queryKey: ["repair-suppliers"],
        queryFn: getRepairSuppliers,
        initialPage: 0,
        initialRowsPerPage: 10,
        initialSearch: "",
    });

    const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
        searchValue,
        SEARCH_DEBOUNCE_MS,
    );

    useEffect(() => {
        setSearch(debouncedSearch);
    }, [debouncedSearch, setSearch]);

    const { data: departmentsResponse } = useQuery({
        queryKey: ["departments", "all-for-repair-suppliers"],
        queryFn: async () => {
            const result = await getDepartments({ page: 1, limit: 500 });
            if (result.error) throw new Error(result.error.message);
            if (!result.data) throw new Error("No data");
            return result.data;
        },
    });

    const departmentItems: SelectableItem[] = useMemo(() => {
        const list = departmentsResponse?.data ?? [];
        return list.map((d: Department) => ({ id: d.id, label: d.name }));
    }, [departmentsResponse?.data]);

    const tabItems: TabItem[] = [
        { value: "suppliers", label: "Proveedores" },
        { value: "settings", label: "Ajustes" },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(event.target.value);
    };

    const handleCreateSupplier = () => {
        setEditingSupplier(null);
        setSelectedDepartmentIds([]);
        setModalOpen(true);
    };

    const handleEditSupplier = (supplier: RepairSupplier) => {
        setEditingSupplier(supplier);
        setSelectedDepartmentIds(supplier.departments.map((d) => d.id));
        setModalOpen(true);
    };

    const handleDeleteSupplier = async (supplier: RepairSupplier) => {
        const confirmed = window.confirm(
            `¿Estás seguro de eliminar el proveedor "${supplier.name}"?`,
        );
        if (!confirmed) return;

        const result = await deleteRepairSupplier(supplier.id);
        if (result.error) {
            showError(result.error.message);
            return;
        }
        showSnackbar("Proveedor desactivado correctamente.");
        refetch();
    };

    const handleCloseModal = () => {
        if (!saving) {
            setModalOpen(false);
            setEditingSupplier(null);
            setSelectedDepartmentIds([]);
        }
    };

    const handleSaveSupplier = async (data: Record<string, unknown>) => {
        setSaving(true);
        const departmentIds = selectedDepartmentIds.map((id) =>
            typeof id === "string" ? parseInt(id, 10) : id,
        ).filter((id) => !Number.isNaN(id));

        if (editingSupplier) {
            const result = await updateRepairSupplier(editingSupplier.id, {
                name: String(data.name ?? ""),
                contactPerson: (data.contactPerson as string) || undefined,
                phone: (data.phone as string) || undefined,
                email: (data.email as string) || undefined,
                departmentIds,
            });
            if (result.error) {
                setSaving(false);
                showError(result.error.message);
                return;
            }
            showSnackbar("Proveedor actualizado correctamente.");
        } else {
            const result = await createRepairSupplier({
                name: String(data.name ?? ""),
                contactPerson: (data.contactPerson as string) || undefined,
                phone: (data.phone as string) || undefined,
                email: (data.email as string) || undefined,
                departmentIds: departmentIds.length > 0 ? departmentIds : undefined,
            });
            if (result.error) {
                setSaving(false);
                showError(result.error.message);
                return;
            }
            showSnackbar("Proveedor creado correctamente.");
        }
        setSaving(false);
        handleCloseModal();
        refetch();
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
    };

    const handleHourlyCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
            setHourlyCost(value);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            showSnackbar("Ajustes guardados.");
        } catch {
            showError("Error al guardar ajustes.");
        } finally {
            setSavingSettings(false);
        }
    };

    const columns: Column<RepairSupplier>[] = [
        {
            id: "id",
            label: "ID",
            type: "id",
            size: "sm",
            maxSize: "sm",
            idPadding: 4,
        },
        {
            id: "name",
            label: "Nombre",
            size: "lg",
        },
        {
            id: "hoursThisMonth",
            label: "Horas este mes",
            type: "number",
            size: "md",
            maxSize: "md",
            align: "left",
        },
        {
            id: "departments",
            label: "Departamentos",
            type: "chipGroup",
            size: "xl",
            chipGroupKey: "name",
            chipGroupMaxVisible: 4,
        },
    ];

    const actions: RowAction<RepairSupplier>[] = [
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEditSupplier,
        },
        {
            id: "delete",
            label: "Eliminar",
            icon: <DeleteIcon fontSize="small" />,
            onClick: handleDeleteSupplier,
            color: "error",
        },
    ];

    const formFields: FormFieldConfig[] = [
        {
            name: "name",
            label: "Nombre del proveedor",
            type: "text",
            placeholder: "Ingresa el nombre del proveedor",
            validation: { required: true },
            xs: 12,
        },
        {
            name: "contactPerson",
            label: "Persona de contacto",
            type: "text",
            placeholder: "Ingresa el nombre de la persona de contacto",
            xs: 12,
        },
        {
            name: "phone",
            label: "Número de teléfono",
            type: "phone",
            placeholder: "Ingresa el número de teléfono",
            xs: 12,
        },
        {
            name: "email",
            label: "Correo electrónico",
            type: "email",
            placeholder: "Ingresa el correo electrónico",
            validation: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                patternMessage: "El correo electrónico tiene un formato inválido",
            },
            xs: 12,
        },
    ];

    return (
        <MainLayout>
            <Title title="Proveedores de reparaciones" />

            <TabsWrapper>
                <Tabs
                    tabs={tabItems}
                    value={activeTab}
                    onChange={handleTabChange}
                />
            </TabsWrapper>

            {activeTab === "suppliers" && (
                <>
                    <HeaderContainer>
                        <Box />
                        <ControlsContainer>
                            <SearchInput
                                size="small"
                                placeholder="Buscar"
                                value={searchInput}
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
                                onClick={handleCreateSupplier}
                            >
                                Nuevo
                            </CreateButton>
                        </ControlsContainer>
                    </HeaderContainer>

                    <TableCrud
                        columns={columns}
                        rows={suppliers}
                        actions={actions}
                        loading={loading}
                        rowKey="id"
                        page={page}
                        rowsPerPage={rowsPerPage}
                        totalRows={totalRows}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        onRowClick={handleEditSupplier}
                        emptyMessage="No hay proveedores de reparaciones registrados"
                    />
                </>
            )}

            <ModalForm
                open={modalOpen}
                onClose={handleCloseModal}
                title={editingSupplier ? editingSupplier.name : "Nuevo proveedor de reparaciones"}
                fields={formFields}
                onConfirm={handleSaveSupplier}
                loading={saving}
                initialValues={
                    editingSupplier
                        ? {
                              name: editingSupplier.name,
                              contactPerson: editingSupplier.contactPerson ?? "",
                              phone: editingSupplier.phone ?? "",
                              email: editingSupplier.email ?? "",
                          }
                        : undefined
                }
                confirmLabel="Guardar cambios"
                cancelLabel="Cancelar"
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{ mt: 2 }}>
                    <MultiSelectAutocomplete
                        label="Departamentos que puede atender"
                        placeholder="Buscar departamentos..."
                        items={departmentItems}
                        selectedIds={selectedDepartmentIds}
                        onChange={setSelectedDepartmentIds}
                        disabled={saving}
                        emptyText="No hay departamentos"
                        emptyChipsText="No hay departamentos seleccionados"
                    />
                </Box>
            </ModalForm>

            {activeTab === "settings" && (
                <SettingsCard>
                    <SectionTitle>Costos por hora</SectionTitle>
                    <FieldContainer>
                        <FormTextField
                            label="Costo"
                            value={hourlyCost}
                            onChange={handleHourlyCostChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">$</InputAdornment>
                                ),
                            }}
                            disabled={savingSettings}
                        />
                    </FieldContainer>
                    <SaveButton
                        variant="contained"
                        color="primary"
                        onClick={handleSaveSettings}
                        disabled={savingSettings || !hourlyCost}
                    >
                        {savingSettings ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            "Guardar cambios"
                        )}
                    </SaveButton>
                    <HelperNote>
                        El nuevo costo por hora será aplicado para nuevas órdenes de servicio,
                        no se afectarán las órdenes ya generadas.
                    </HelperNote>
                </SettingsCard>
            )}
        </MainLayout>
    );
}
