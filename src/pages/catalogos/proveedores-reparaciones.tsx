import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
    Box,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, FormTextField, Tabs, ModalForm, MultiSelectChips } from "@/components";
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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Department {
    id: number;
    name: string;
}

interface RepairSupplier {
    id: number;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    hoursThisMonth: number;
    departments: Department[];
}

interface GetRepairSuppliersParams {
    page: number;
    limit: number;
    search?: string;
}

interface GetRepairSuppliersResponse {
    data: RepairSupplier[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================================
// MOCK DATA - Repair suppliers for furniture store
// ============================================================================

const DUMMY_DEPARTMENTS: Department[] = [
    { id: 1, name: "Muebles" },
    { id: 2, name: "Sofás" },
    { id: 3, name: "Cocinas" },
    { id: 4, name: "Sillas" },
    { id: 5, name: "Colchones" },
    { id: 6, name: "Electrodomésticos" },
];

const DUMMY_REPAIR_SUPPLIERS: RepairSupplier[] = [
    {
        id: 1,
        name: "Ebanista Armendariz",
        contactPerson: "Julio Armendariz",
        phone: "667 123 4567",
        email: "julio.armendariz@gmail.com",
        hoursThisMonth: 12,
        departments: [
            { id: 1, name: "Muebles" },
            { id: 2, name: "Sofás" },
            { id: 3, name: "Cocinas" },
            { id: 4, name: "Sillas" },
        ],
    },
    {
        id: 2,
        name: "Tapicería Juventud",
        hoursThisMonth: 0,
        departments: [
            { id: 2, name: "Sofás" },
            { id: 4, name: "Sillas" },
        ],
    },
    {
        id: 3,
        name: "Ebanista Julio Armendariz",
        hoursThisMonth: 2,
        departments: [
            { id: 1, name: "Muebles" },
            { id: 2, name: "Sofás" },
            { id: 3, name: "Cocinas" },
            { id: 4, name: "Sillas" },
        ],
    },
    {
        id: 4,
        name: "Carpintería El Roble",
        hoursThisMonth: 45,
        departments: [
            { id: 1, name: "Muebles" },
            { id: 2, name: "Sofás" },
            { id: 3, name: "Cocinas" },
            { id: 4, name: "Sillas" },
        ],
    },
    {
        id: 5,
        name: "Tapicería Premium",
        hoursThisMonth: 32,
        departments: [
            { id: 2, name: "Sofás" },
            { id: 4, name: "Sillas" },
            { id: 5, name: "Colchones" },
        ],
    },
    {
        id: 6,
        name: "Reparaciones Electro Plus",
        hoursThisMonth: 131,
        departments: [
            { id: 6, name: "Electrodomésticos" },
        ],
    },
    {
        id: 7,
        name: "Carpintería Fina del Norte",
        hoursThisMonth: 0,
        departments: [
            { id: 1, name: "Muebles" },
            { id: 3, name: "Cocinas" },
        ],
    },
    {
        id: 8,
        name: "Tapicería La Moderna",
        hoursThisMonth: 2,
        departments: [
            { id: 2, name: "Sofás" },
            { id: 4, name: "Sillas" },
        ],
    },
    {
        id: 9,
        name: "Ebanistería Artesanal",
        hoursThisMonth: 4,
        departments: [
            { id: 1, name: "Muebles" },
            { id: 2, name: "Sofás" },
            { id: 3, name: "Cocinas" },
            { id: 4, name: "Sillas" },
        ],
    },
    {
        id: 10,
        name: "Servicio Técnico Hogar",
        hoursThisMonth: 78,
        departments: [
            { id: 6, name: "Electrodomésticos" },
        ],
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getRepairSuppliers(
    params: GetRepairSuppliersParams
): Promise<GetRepairSuppliersResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_REPAIR_SUPPLIERS];

    // Filter by search
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
            (s) =>
                s.name.toLowerCase().includes(searchLower) ||
                s.departments.some((d) => d.name.toLowerCase().includes(searchLower))
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

async function saveRepairSupplier(
    supplier: Omit<RepairSupplier, "id" | "hoursThisMonth"> & { id?: number }
): Promise<RepairSupplier> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const savedSupplier: RepairSupplier = {
        id: supplier.id || Date.now(),
        name: supplier.name,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone,
        email: supplier.email,
        hoursThisMonth: 0,
        departments: supplier.departments,
    };
    console.log("[API] Saved repair supplier:", savedSupplier);
    return savedSupplier;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProveedoresReparaciones() {
    const router = useRouter();

    // State management
    const [activeTab, setActiveTab] = useState("suppliers");
    const [suppliers, setSuppliers] = useState<RepairSupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<RepairSupplier | null>(null);
    const [saving, setSaving] = useState(false);
    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<(string | number)[]>([]);

    // Settings tab state
    const [hourlyCost, setHourlyCost] = useState("720.00");
    const [savingSettings, setSavingSettings] = useState(false);

    // Tab options
    const tabItems: TabItem[] = [
        { value: "suppliers", label: "Proveedores" },
        { value: "settings", label: "Ajustes" },
    ];

    // Fetch suppliers
    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getRepairSuppliers({
                page,
                limit: rowsPerPage,
                search: searchValue,
            });
            setSuppliers(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[ProveedoresReparaciones] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    useEffect(() => {
        setPage(0);
    }, [searchValue]);

    // Event handlers
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
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

    const handleCloseModal = () => {
        if (!saving) {
            setModalOpen(false);
            setEditingSupplier(null);
            setSelectedDepartmentIds([]);
        }
    };

    const handleSaveSupplier = async (data: Record<string, unknown>) => {
        setSaving(true);
        try {
            const selectedDepartments = DUMMY_DEPARTMENTS.filter((d) =>
                selectedDepartmentIds.includes(d.id)
            );

            const supplierData = {
                id: editingSupplier?.id,
                name: String(data.name || ""),
                contactPerson: String(data.contactPerson || ""),
                phone: String(data.phone || ""),
                email: String(data.email || ""),
                departments: selectedDepartments,
            };

            await saveRepairSupplier(supplierData);
            
            // Refresh suppliers list
            await fetchSuppliers();
            
            setModalOpen(false);
            setEditingSupplier(null);
            setSelectedDepartmentIds([]);
        } catch (err) {
            console.error("[ProveedoresReparaciones] Error saving supplier:", err);
        } finally {
            setSaving(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Settings handlers
    const handleHourlyCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and decimal point
        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
            setHourlyCost(value);
        }
    };

    const handleSaveSettings = async () => {
        setSavingSettings(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            console.log("[Settings] Saved hourly cost:", hourlyCost);
        } catch (err) {
            console.error("[Settings] Error saving:", err);
        } finally {
            setSavingSettings(false);
        }
    };

    // Table columns
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

    // Row actions (for menu)
    const actions: RowAction<RepairSupplier>[] = [
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEditSupplier,
        },
    ];

    // Form fields configuration
    const formFields: FormFieldConfig[] = [
        {
            name: "name",
            label: "Nombre del proveedor",
            type: "text",
            placeholder: "Ingresa el nombre del proveedor",
            validation: {
                required: true,
            },
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

    // Convert departments to SelectableItem format
    const departmentItems: SelectableItem[] = DUMMY_DEPARTMENTS.map((d) => ({
        id: d.id,
        label: d.name,
    }));

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
                        <Box /> {/* Empty box for spacing */}
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

            {/* Supplier Form Modal */}
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
                              contactPerson: editingSupplier.contactPerson || "",
                              phone: editingSupplier.phone || "",
                              email: editingSupplier.email || "",
                          }
                        : undefined
                }
                confirmLabel="Guardar cambios"
                cancelLabel="Cancelar"
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{ mt: 2 }}>
                    <MultiSelectChips
                        label="Departamentos que puede atender"
                        items={departmentItems}
                        selectedIds={selectedDepartmentIds}
                        onChange={setSelectedDepartmentIds}
                        disabled={saving}
                        emptyText="No hay departamentos seleccionados"
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
