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
import { getUsers as getUsersApi, type UserListItem } from "@/services/users.service";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type User = UserListItem;

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
            const response = await getUsersApi({
                page: page + 1,
                limit: rowsPerPage,
                search: searchValue || undefined,
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
