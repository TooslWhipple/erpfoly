import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { IconButton } from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud, Breadcrumbs, ModalForm } from "@/components";
import type { Column } from "@/components/TableCrud";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { FormFieldConfig } from "@/components/Form";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface BranchDiscount {
    id: number;
    name: string;
    margin: number;
    type: "credit" | "cash" | "layaway";
    startDate: string;
    endDate: string | null;
    departments: string;
    groups: string;
    branches: string;
}

interface Branch {
    id: number;
    name: string;
    city: string;
}

interface GetDiscountsParams {
    branchId: number;
    page: number;
    limit: number;
}

interface GetDiscountsResponse {
    data: BranchDiscount[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_BRANCHES: Record<number, Branch> = {
    1: { id: 1, name: "Foly Muebles Matriz", city: "Tampico" },
    2: { id: 2, name: "Foly Muebles Tampico Centro", city: "Tampico" },
    3: { id: 3, name: "Foly Muebles San Luis", city: "San Luis Potosí" },
};

const DUMMY_DISCOUNTS: BranchDiscount[] = [
    {
        id: 1,
        name: "Crédito permanente",
        margin: 5,
        type: "credit",
        startDate: "2025-09-01",
        endDate: null,
        departments: "Todos",
        groups: "Todos",
        branches: "Todas",
    },
    {
        id: 2,
        name: "Mes de línea blanca",
        margin: 32,
        type: "credit",
        startDate: "2025-09-01",
        endDate: "2025-09-30",
        departments: "Línea blanca",
        groups: "7 grupos",
        branches: "Todas",
    },
    {
        id: 3,
        name: "Buen fin 2024",
        margin: 25,
        type: "cash",
        startDate: "2025-11-13",
        endDate: "2025-11-17",
        departments: "Todos",
        groups: "Todos",
        branches: "Todas",
    },
    {
        id: 4,
        name: "Black Friday 2024",
        margin: 20,
        type: "credit",
        startDate: "2025-11-28",
        endDate: "2025-11-28",
        departments: "Todos",
        groups: "Todos",
        branches: "Todas",
    },
    {
        id: 5,
        name: "Día de las madres",
        margin: 29,
        type: "cash",
        startDate: "2025-09-01",
        endDate: "2025-09-30",
        departments: "3 dptos",
        groups: "7 grupos",
        branches: "Todas",
    },
    {
        id: 6,
        name: "Aniversario Foly",
        margin: 29,
        type: "cash",
        startDate: "2025-09-01",
        endDate: "2025-09-30",
        departments: "Todos",
        groups: "7 grupos",
        branches: "Todas",
    },
    {
        id: 7,
        name: "Día del padre",
        margin: 29,
        type: "cash",
        startDate: "2025-09-01",
        endDate: "2025-09-30",
        departments: "Todos",
        groups: "7 grupos",
        branches: "Todas",
    },
    {
        id: 8,
        name: "Temporada de calor",
        margin: 29,
        type: "layaway",
        startDate: "2025-09-01",
        endDate: "2025-09-30",
        departments: "Aire acondicio...",
        groups: "Minisplits",
        branches: "Todas",
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getBranch(id: number): Promise<Branch | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return DUMMY_BRANCHES[id] || null;
}

async function getDiscounts(params: GetDiscountsParams): Promise<GetDiscountsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const total = DUMMY_DISCOUNTS.length;
    const start = params.page * params.limit;
    const end = start + params.limit;
    const paginatedData = DUMMY_DISCOUNTS.slice(start, end);

    return {
        data: paginatedData,
        total,
        page: params.page,
        limit: params.limit,
    };
}

async function deleteDiscount(id: number): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    console.log("[API] Deleted discount:", id);
    return { success: true };
}

async function createDiscount(
    _branchId: number,
    data: Partial<BranchDiscount>
): Promise<BranchDiscount> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newDiscount: BranchDiscount = {
        id: Date.now(),
        name: data.name || "",
        margin: data.margin || 0,
        type: data.type || "credit",
        startDate: data.startDate || new Date().toISOString().split("T")[0],
        endDate: data.endDate || null,
        departments: data.departments || "Todos",
        groups: data.groups || "Todos",
        branches: data.branches || "Todas",
    };
    console.log("[API] Created discount:", newDiscount);
    return newDiscount;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(dateStr: string | null): string {
    if (!dateStr) return "Sin fecha fin";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getTypeLabel(type: BranchDiscount["type"]): string {
    const labels: Record<BranchDiscount["type"], string> = {
        credit: "Crédito",
        cash: "Contado",
        layaway: "Apartados",
    };
    return labels[type];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BranchDetailPage() {
    const router = useRouter();
    const { id } = router.query;
    const branchId = Number(id);

    // State
    const [branch, setBranch] = useState<Branch | null>(null);
    const [discounts, setDiscounts] = useState<BranchDiscount[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch branch details
    useEffect(() => {
        if (!branchId || isNaN(branchId)) return;

        async function loadBranch() {
            const branchData = await getBranch(branchId);
            setBranch(branchData);
        }

        loadBranch();
    }, [branchId]);

    // Fetch discounts
    const fetchDiscounts = useCallback(async () => {
        if (!branchId || isNaN(branchId)) return;

        setLoading(true);
        try {
            const response = await getDiscounts({
                branchId,
                page,
                limit: rowsPerPage,
            });
            setDiscounts(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[BranchDetail] Error fetching discounts:", err);
        } finally {
            setLoading(false);
        }
    }, [branchId, page, rowsPerPage]);

    useEffect(() => {
        fetchDiscounts();
    }, [fetchDiscounts]);

    // Event handlers
    const handleDeleteDiscount = async (discount: BranchDiscount) => {
        const confirmed = window.confirm(
            `¿Estás seguro de eliminar el descuento "${discount.name}"?`
        );
        if (!confirmed) return;

        try {
            await deleteDiscount(discount.id);
            fetchDiscounts();
        } catch (err) {
            console.error("[BranchDetail] Error deleting discount:", err);
        }
    };

    const handleOpenModal = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleSaveDiscount = async (data: Record<string, unknown>) => {
        setSaving(true);
        try {
            await createDiscount(branchId, {
                name: data.name as string,
                margin: Number(data.margin),
                type: data.type as BranchDiscount["type"],
                startDate: data.startDate as string,
                endDate: data.endDate as string | null,
                departments: data.departments as string,
                groups: data.groups as string,
                branches: data.branches as string,
            });
            handleCloseModal();
            fetchDiscounts();
        } catch (err) {
            console.error("[BranchDetail] Error saving discount:", err);
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

    // Breadcrumbs
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Sucursales", href: "/catalogos/sucursales" },
        { label: branch?.city || "Cargando..." },
    ];

    // Table columns
    const columns: Column<BranchDiscount>[] = [
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
            size: "lg",
        },
        {
            id: "margin",
            label: "Margen",
            size: "sm",
            format: (value) => `${value}%`,
        },
        {
            id: "type",
            label: "Tipo",
            size: "sm",
            format: (value) => getTypeLabel(value as BranchDiscount["type"]),
        },
        {
            id: "startDate",
            label: "Inicio",
            size: "md",
            format: (value) => formatDate(value as string),
        },
        {
            id: "endDate",
            label: "Fin",
            size: "md",
            format: (value) => formatDate(value as string | null),
        },
        {
            id: "departments",
            label: "Departamentos",
            size: "md",
            truncate: true,
        },
        {
            id: "groups",
            label: "Grupos",
            size: "sm",
        },
        {
            id: "branches",
            label: "Sucursales",
            size: "sm",
        },
        {
            id: "actions",
            label: "",
            size: "xs",
            format: (_, row) => (
                <IconButton
                    size="small"
                    onClick={() => handleDeleteDiscount(row)}
                    sx={{ color: "text.secondary" }}
                >
                    <DeleteIcon fontSize="small" />
                </IconButton>
            ),
        },
    ];

    // Form fields for new discount
    const discountFormFields: FormFieldConfig[] = [
        {
            name: "name",
            label: "Nombre del descuento",
            type: "text",
            placeholder: "Ej. Promoción de verano",
            validation: { required: true, minLength: 3 },
            xs: 12,
        },
        {
            name: "margin",
            label: "Margen (%)",
            type: "number",
            placeholder: "Ej. 25",
            validation: { required: true, min: 1, max: 100 },
            xs: 12,
            sm: 6,
        },
        {
            name: "type",
            label: "Tipo de venta",
            type: "select",
            options: [
                { value: "credit", label: "Crédito" },
                { value: "cash", label: "Contado" },
                { value: "layaway", label: "Apartados" },
            ],
            validation: { required: true },
            xs: 12,
            sm: 6,
        },
        {
            name: "startDate",
            label: "Fecha de inicio",
            type: "date",
            validation: { required: true },
            xs: 12,
            sm: 6,
        },
        {
            name: "endDate",
            label: "Fecha de fin",
            type: "date",
            helperText: "Dejar vacío para sin fecha de fin",
            xs: 12,
            sm: 6,
        },
        {
            name: "departments",
            label: "Departamentos",
            type: "text",
            placeholder: "Ej. Todos, Línea blanca",
            defaultValue: "Todos",
            xs: 12,
            sm: 6,
        },
        {
            name: "groups",
            label: "Grupos",
            type: "text",
            placeholder: "Ej. Todos, 7 grupos",
            defaultValue: "Todos",
            xs: 12,
            sm: 6,
        },
    ];

    // Title actions
    const titleActions = [
        {
            id: "new-discount",
            label: "Nuevo descuento",
            icon: <AddIcon />,
            onClick: handleOpenModal,
        },
    ];

    return (
        <MainLayout>
            <Breadcrumbs items={breadcrumbItems} />

            <Title
                title={`Sucursal ${branch?.city || ""}`}
                description="Gestiona los descuentos activos de esta sucursal."
                actions={titleActions}
            />

            <TableCrud
                columns={columns}
                rows={discounts}
                loading={loading}
                rowKey="id"
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalRows}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                emptyMessage="No hay descuentos registrados para esta sucursal"
            />

            <ModalForm
                open={modalOpen}
                onClose={handleCloseModal}
                title="Nuevo descuento"
                description="Configura un nuevo descuento para esta sucursal."
                fields={discountFormFields}
                onConfirm={handleSaveDiscount}
                loading={saving}
                confirmLabel="Guardar"
                cancelLabel="Cancelar"
                maxWidth="sm"
            />
        </MainLayout>
    );
}
