import { useState, useEffect, useMemo } from "react";
import { InputAdornment, Stack } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, TabFilters, ModalFormZod } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import {
    SettingsCard,
    SectionTitle,
    FieldContainer,
    HelperNote,
} from "@/styles/catalogos/proveedores-reparaciones.styles";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getRepairSuppliers,
    createRepairSupplier,
    updateRepairSupplier,
    deleteRepairSupplier,
    getRepairSupplierConfiguration,
    updateRepairSupplierConfiguration,
} from "@/services/repair-suppliers.service";
import type { RepairSupplier } from "@/services/repair-suppliers.service";
import { getDepartments } from "@/services/departments.service";
import type { Department } from "@/services/departments.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { schemas, filters } from "@/forms";
import {
    defineFormFields,
    FormFromFields,
    type SchemaOutputFromFields,
} from "@/forms";
import { z } from "zod";
import type { AutocompleteItem } from "@/forms";

const SEARCH_DEBOUNCE_MS = 300;

type RepairSupplierForm = {
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    departmentIds?: (string | number)[];
};

function buildRepairSupplierFields(departmentItems: AutocompleteItem[]) {
    return defineFormFields<RepairSupplierForm>()([
        {
            name: "name",
            schema: schemas.requiredString(1, "El nombre del proveedor es requerido"),
            label: "Nombre del proveedor",
            type: "text",
            placeholder: "Ingresa el nombre del proveedor",
        },
        {
            name: "contactPerson",
            schema: z.string().optional(),
            label: "Persona de contacto",
            type: "text",
            placeholder: "Ingresa el nombre de la persona de contacto",
        },
        {
            name: "phone",
            schema: schemas.optionalString(),
            label: "Número de teléfono",
            type: "text",
            placeholder: "Ingresa el número de teléfono",
            filter: filters.onlyNumbers(10),
        },
        {
            name: "email",
            schema: z.preprocess(
                (v) => (v === "" ? undefined : v),
                schemas.emailString().optional(),
            ),
            label: "Correo electrónico",
            type: "text",
            placeholder: "Ingresa el correo electrónico",
        },
        {
            name: "departmentIds",
            schema: z.array(z.union([z.string(), z.number()])).optional(),
            label: "Departamentos que puede atender",
            type: "autocomplete",
            placeholder: "Buscar departamentos...",
            items: departmentItems,
        },
    ]);
}

const COST_INPUT_ADORNMENT = (
    <InputAdornment position="start">$</InputAdornment>
);

const settingsFields = defineFormFields<{ hourlyCost: string }>()([
    {
        name: "hourlyCost",
        schema: schemas
            .decimalString(2, "El costo es requerido")
            .refine(
                (v) => parseFloat(String(v).replace(/,/g, "")) >= 0,
                "El costo debe ser mayor o igual a 0",
            ),
        label: "Costo",
        type: "text",
        filter: filters.decimal(2),
        slotProps: {
            input: { startAdornment: COST_INPUT_ADORNMENT },
        },
    },
]);

export default function ProveedoresReparaciones() {
    const showSnackbar = useSnackbarStore((s) => s.showSuccess);
    const showError = useSnackbarStore((s) => s.showError);
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState("suppliers");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<RepairSupplier | null>(null);
    const [saving, setSaving] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    const { data: configData } = useQuery({
        queryKey: ["repair-supplier-configuration"],
        queryFn: async () => {
            const result = await getRepairSupplierConfiguration();
            if (result.error) throw new Error(result.error.message);
            if (!result.data) throw new Error("No data");
            return result.data;
        },
        enabled: activeTab === "settings",
    });

    const handleSaveSettings = async (data: { hourlyCost: string }) => {
        setSavingSettings(true);
        const result = await updateRepairSupplierConfiguration({
            cost: parseFloat(data.hourlyCost.replace(/,/g, "")),
        });
        setSavingSettings(false);
        if (result.error) {
            showError(result.error.message);
            return;
        }
        await queryClient.invalidateQueries({ queryKey: ["repair-supplier-configuration"] });
        showSnackbar(result.data?.message ?? "Ajustes guardados.");
    };

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

    const departmentItems: AutocompleteItem[] = useMemo(() => {
        const list = departmentsResponse?.rows ?? [];
        return list.map((d: Department) => ({ id: d.id, label: d.name }));
    }, [departmentsResponse?.rows]);

    const repairSupplierFields = useMemo(
        () => buildRepairSupplierFields(departmentItems),
        [departmentItems],
    );

    const tabs = [
        { value: "suppliers", label: "Proveedores", count: totalRows },
        { value: "settings", label: "Ajustes" },
    ];

    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

    const handleCreateSupplier = () => {
        setEditingSupplier(null);
        setModalOpen(true);
    };

    const handleEditSupplier = (supplier: RepairSupplier) => {
        setEditingSupplier(supplier);
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
        showSnackbar(result.data?.message ?? "Proveedor desactivado correctamente.");
        refetch();
    };

    const handleCloseModal = () => {
        if (!saving) {
            setModalOpen(false);
            setEditingSupplier(null);
        }
    };

    const handleSaveSupplier = async (
        data: SchemaOutputFromFields<typeof repairSupplierFields>,
    ) => {
        setSaving(true);
        const departmentIds = (data.departmentIds ?? []).map((id) =>
            typeof id === "string" ? parseInt(id, 10) : id,
        ).filter((id) => !Number.isNaN(id));

        if (editingSupplier) {
            const result = await updateRepairSupplier(editingSupplier.id, {
                name: data.name,
                contactPerson: data.contactPerson || undefined,
                phone: data.phone || undefined,
                email: data.email || undefined,
                departmentIds,
            });
            if (result.error) {
                setSaving(false);
                showError(result.error.message);
                return;
            }
            showSnackbar(result.data?.message ?? "Proveedor actualizado correctamente.");
        } else {
            const result = await createRepairSupplier({
                name: data.name,
                contactPerson: data.contactPerson || undefined,
                phone: data.phone || undefined,
                email: data.email || undefined,
                departmentIds: departmentIds.length > 0 ? departmentIds : undefined,
            });
            if (result.error) {
                setSaving(false);
                showError(result.error.message);
                return;
            }
            showSnackbar(result.data?.message ?? "Proveedor creado correctamente.");
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

    return (
        <MainLayout>
            <Stack direction="column" spacing={3}>

                <Title title="Proveedores de reparaciones" />

                <TabFilters
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    showSearch={activeTab === "suppliers"}
                    searchValue={searchInput}
                    onSearchChange={handleSearchChange}
                    searchPlaceholder="Buscar"
                    actions={
                        activeTab === "suppliers"
                            ? [
                                {
                                    label: "Nuevo",
                                    onClick: handleCreateSupplier,
                                    variant: "contained",
                                    color: "primary",
                                    showIcon: true,
                                },
                            ]
                            : []
                    }
                />

                {
                    activeTab === "suppliers" &&
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
                }


                {
                    activeTab === "settings" &&
                    <SettingsCard>
                        <SectionTitle>Costos por hora</SectionTitle>
                        <FieldContainer>
                            <FormFromFields
                                key={configData?.cost ?? "initial"}
                                fields={settingsFields}
                                defaultValues={{
                                    hourlyCost:
                                        configData != null
                                            ? Number(configData.cost).toFixed(2)
                                            : "0",
                                }}
                                onSubmit={handleSaveSettings}
                                confirmLabel="Guardar cambios"
                                loading={savingSettings}
                                actionsSx={{ justifyContent: "flex-start" }}
                            />
                        </FieldContainer>
                        <HelperNote>
                            El nuevo costo por hora será aplicado para nuevas órdenes de servicio,
                            no se afectarán las órdenes ya generadas.
                        </HelperNote>
                    </SettingsCard>
                }
            </Stack>

            <ModalFormZod
                key={editingSupplier?.id ?? "new"}
                open={modalOpen}
                onClose={handleCloseModal}
                title={
                    editingSupplier
                        ? editingSupplier.name
                        : "Nuevo proveedor de reparaciones"
                }
                fields={repairSupplierFields}
                defaultValues={
                    editingSupplier
                        ? {
                            name: editingSupplier.name,
                            contactPerson: editingSupplier.contactPerson ?? "",
                            phone: editingSupplier.phone ?? "",
                            email: editingSupplier.email ?? "",
                            departmentIds: editingSupplier.departments.map((d) => d.id),
                        }
                        : {
                            name: "",
                            contactPerson: "",
                            phone: "",
                            email: "",
                            departmentIds: [],
                        }
                }
                onSubmit={handleSaveSupplier}
                loading={saving}
                confirmLabel="Guardar cambios"
                maxWidth="md"
                fullWidth
            />

        </MainLayout>
    );
}
