import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { InputAdornment } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud } from "@/components";
import type { Column, RowAction } from "@/components/TableCrud";
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

interface Role {
    id: number;
    name: string;
    updatedAt: string;
}

interface GetRolesParams {
    page: number;
    limit: number;
    search?: string;
}

interface GetRolesResponse {
    data: Role[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================================
// MOCK DATA - System roles for e-commerce platform
// ============================================================================

const DUMMY_ROLES: Role[] = [
    {
        id: 1,
        name: "Administrador",
        updatedAt: "2024-12-05T11:21:00",
    },
    {
        id: 2,
        name: "Vendedor",
        updatedAt: "2024-12-05T11:21:00",
    },
    {
        id: 3,
        name: "Mesa de control",
        updatedAt: "2024-12-05T11:21:00",
    },
    {
        id: 4,
        name: "Almacenista",
        updatedAt: "2024-12-05T11:21:00",
    },
    {
        id: 5,
        name: "Gestor de rutas",
        updatedAt: "2024-12-05T11:21:00",
    },
    {
        id: 6,
        name: "Cajero",
        updatedAt: "2024-12-04T09:15:00",
    },
    {
        id: 7,
        name: "Supervisor de tienda",
        updatedAt: "2024-12-03T14:30:00",
    },
    {
        id: 8,
        name: "Gerente regional",
        updatedAt: "2024-12-02T16:45:00",
    },
    {
        id: 9,
        name: "Analista de crédito",
        updatedAt: "2024-12-01T10:00:00",
    },
    {
        id: 10,
        name: "Cobranza",
        updatedAt: "2024-11-30T08:30:00",
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getRoles(params: GetRolesParams): Promise<GetRolesResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_ROLES];

    // Filter by search
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter((r) =>
            r.name.toLowerCase().includes(searchLower)
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
// HELPERS
// ============================================================================

function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    const hour12 = hours % 12 || 12;

    return `${dayName} ${day} de ${month}. ${hour12}:${minutes} ${ampm}`;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Roles() {
    const router = useRouter();

    // State management
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Fetch roles
    const fetchRoles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getRoles({
                page,
                limit: rowsPerPage,
                search: searchValue,
            });
            setRoles(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[Roles] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        setPage(0);
    }, [searchValue]);

    // Event handlers
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleCreateRole = () => {
        router.push("/catalogos/roles/nuevo");
    };

    const handleEditRole = (role: Role) => {
        router.push(`/catalogos/roles/${role.id}`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Table columns
    const columns: Column<Role>[] = [
        {
            id: "id",
            label: "ID",
            type: "id",
            size: "xs",
            maxSize: "xs",
            idPadding: 4,
        },
        {
            id: "name",
            label: "Nombre",
            size: "xl",
        },
        {
            id: "updatedAt",
            label: "Últ. Actualización",
            size: "xl",
            format: (value) => formatDateTime(value as string),
        },
    ];

    // Row actions (for menu)
    const actions: RowAction<Role>[] = [
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEditRole,
        },
    ];

    return (
        <MainLayout>
            <HeaderContainer>
                <Title title="Roles" />
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
                        onClick={handleCreateRole}
                    >
                        Nuevo
                    </CreateButton>
                </ControlsContainer>
            </HeaderContainer>

            <TableCrud
                columns={columns}
                rows={roles}
                actions={actions}
                loading={loading}
                rowKey="id"
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalRows}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onRowClick={handleEditRole}
                emptyMessage="No hay roles registrados"
            />
        </MainLayout>
    );
}
