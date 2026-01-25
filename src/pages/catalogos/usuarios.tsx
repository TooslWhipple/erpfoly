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
} from "@/styles/catalogos/catalogos.styledComponents";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
    id: number;
    name: string;
    email: string;
    roleId: number;
    roleName: string;
}

interface GetUsersParams {
    page: number;
    limit: number;
    search?: string;
}

interface GetUsersResponse {
    data: User[];
    total: number;
    page: number;
    limit: number;
}

// ============================================================================
// MOCK DATA - Users for e-commerce platform
// ============================================================================

const DUMMY_USERS: User[] = [
    {
        id: 1,
        name: "Julio Armando López Inzunza",
        email: "julio.lopez@foly.com",
        roleId: 1,
        roleName: "Administrador",
    },
    {
        id: 2,
        name: "Emiliano Zapata Salazar",
        email: "emiliano@foly.com",
        roleId: 2,
        roleName: "Cajas",
    },
    {
        id: 3,
        name: "Frida Kahlo Calderón",
        email: "frida.khalo@foly.com",
        roleId: 3,
        roleName: "Gestor de rutas",
    },
    {
        id: 4,
        name: "Diego Rivera Barrientos",
        email: "diego.rivera@foly.com",
        roleId: 4,
        roleName: "Inventarios",
    },
    {
        id: 5,
        name: "Octavio Paz Lozano",
        email: "ocatvio.paz@foly.com",
        roleId: 1,
        roleName: "Administrador",
    },
    {
        id: 6,
        name: "María Félix Gutiérrez",
        email: "maria.felix@foly.com",
        roleId: 5,
        roleName: "Vendedor",
    },
    {
        id: 7,
        name: "Carlos Fuentes Macías",
        email: "carlos.fuentes@foly.com",
        roleId: 6,
        roleName: "Analista de crédito",
    },
    {
        id: 8,
        name: "Elena Poniatowska Amor",
        email: "elena.poniatowska@foly.com",
        roleId: 7,
        roleName: "Cobranza",
    },
    {
        id: 9,
        name: "Alfonso Cuarón Orozco",
        email: "alfonso.cuaron@foly.com",
        roleId: 8,
        roleName: "Supervisor",
    },
    {
        id: 10,
        name: "Guillermo del Toro Gómez",
        email: "guillermo.deltoro@foly.com",
        roleId: 4,
        roleName: "Inventarios",
    },
    {
        id: 11,
        name: "Salma Hayek Pinault",
        email: "salma.hayek@foly.com",
        roleId: 5,
        roleName: "Vendedor",
    },
    {
        id: 12,
        name: "Gael García Bernal",
        email: "gael.garcia@foly.com",
        roleId: 2,
        roleName: "Cajas",
    },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getUsers(params: GetUsersParams): Promise<GetUsersResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredData = [...DUMMY_USERS];

    // Filter by search (name or email)
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredData = filteredData.filter(
            (u) =>
                u.name.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower) ||
                u.roleName.toLowerCase().includes(searchLower)
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

export default function Usuarios() {
    const router = useRouter();

    // State management
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    // Fetch users
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getUsers({
                page,
                limit: rowsPerPage,
                search: searchValue,
            });
            setUsers(response.data);
            setTotalRows(response.total);
        } catch (err) {
            console.error("[Usuarios] Error fetching:", err);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchValue]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(0);
    }, [searchValue]);

    // Event handlers
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleCreateUser = () => {
        router.push("/catalogos/usuarios/nuevo");
    };

    const handleEditUser = (user: User) => {
        router.push(`/catalogos/usuarios/${user.id}`);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
    };

    // Table columns
    const columns: Column<User>[] = [
        {
            id: "id",
            label: "ID",
            type: "id",
            size: "sm",
            maxSize: "xs",
            idPadding: 4,
        },
        {
            id: "name",
            label: "Nombre",
            size: "xl",
        },
        {
            id: "email",
            label: "Correo electrónico",
            size: "xl",
        },
        {
            id: "roleName",
            label: "Rol",
            size: "lg",
        },
    ];

    // Row actions (for menu)
    const actions: RowAction<User>[] = [
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEditUser,
        },
    ];

    return (
        <MainLayout>
            <HeaderContainer>
                <Title title="Usuarios" />
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
                        onClick={handleCreateUser}
                    >
                        Nuevo
                    </CreateButton>
                </ControlsContainer>
            </HeaderContainer>

            <TableCrud
                columns={columns}
                rows={users}
                actions={actions}
                loading={loading}
                rowKey="id"
                page={page}
                rowsPerPage={rowsPerPage}
                totalRows={totalRows}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                onRowClick={handleEditUser}
                emptyMessage="No hay usuarios registrados"
            />
        </MainLayout>
    );
}
