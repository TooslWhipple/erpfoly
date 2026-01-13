import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { styled } from "@mui/material/styles";
import {
    Box,
    InputAdornment,
    Tabs,
    Tab,
    Paper,
    Typography,
    Button,
    CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, FormTextField } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
import {
    HeaderContainer,
    ControlsContainer,
    SearchInput,
    CreateButton,
    SearchIconStyled,
} from "./catalogos.styledComponents";
import { colors } from "@/styles/theme";

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
// STYLED COMPONENTS
// ============================================================================

const TabsContainer = styled(Box)(({ theme }) => ({
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: theme.spacing(3),
}));

const StyledTabs = styled(Tabs)({
    "& .MuiTabs-indicator": {
        backgroundColor: "#232325",
        height: 2,
    },
});

const StyledTab = styled(Tab)({
    textTransform: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    color: "#71717A",
    minWidth: 120,
    "&.Mui-selected": {
        color: "#232325",
    },
});

const SettingsCard = styled(Paper)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(3),
    width: "100%",
    boxShadow: "none",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1.125rem",
    fontWeight: 600,
    color: "#232325",
    marginBottom: theme.spacing(2),
}));

const FieldContainer = styled(Box)({
    maxWidth: 420,
});

const SaveButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(2),
    height: 40,
    minWidth: 160,
}));

const HelperNote = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: "#71717A",
    marginTop: theme.spacing(2),
    maxWidth: 600,
    lineHeight: 1.5,
}));

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProveedoresReparaciones() {
    const router = useRouter();

    // State management
    const [activeTab, setActiveTab] = useState(0);
    const [suppliers, setSuppliers] = useState<RepairSupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Settings tab state
    const [hourlyCost, setHourlyCost] = useState("720.00");
    const [savingSettings, setSavingSettings] = useState(false);

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
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleCreateSupplier = () => {
        router.push("/catalogos/proveedores-reparaciones/nuevo");
    };

    const handleEditSupplier = (supplier: RepairSupplier) => {
        router.push(`/catalogos/proveedores-reparaciones/${supplier.id}`);
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

    return (
        <MainLayout>
            <Title title="Proveedores de reparaciones" />

            <TabsContainer>
                <StyledTabs value={activeTab} onChange={handleTabChange}>
                    <StyledTab label="Proveedores" />
                    <StyledTab label="Ajustes" />
                </StyledTabs>
            </TabsContainer>

            {activeTab === 0 && (
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

            {activeTab === 1 && (
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
