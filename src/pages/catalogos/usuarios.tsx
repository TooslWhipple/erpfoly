import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { InputAdornment, Stack } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon } from "@mui/icons-material";
import { MainLayout, Title, TableCrud } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import {
    ControlsContainer,
    SearchInput,
    CreateButton,
    SearchIconStyled,
} from "@/styles/catalogos/catalogos.styledComponents";
import { getUsers as getUsersApi, type UserListItem } from "@/services/users.service";

type User = UserListItem;

const ESTATUS_CHIP_LABELS: Record<string, string> = {
    ACTIVE: "Activo",
    INACTIVE: "Inactivo",
};
const ESTATUS_CHIP_VARIANTS: Record<string, StatusChipVariant> = {
    ACTIVE: "success",
    INACTIVE: "error",
};

export default function Usuarios() {
    const router = useRouter();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const result = await getUsersApi({
            page: page + 1,
            limit: rowsPerPage,
            search: searchValue || undefined,
        });

        if (result.error) {
            setUsers([]);
            setTotalRows(0);
        } else if (result.data) {
            setUsers(result.data.rows);
            setTotalRows(result.data.total);
        }

        setLoading(false);
    }, [page, rowsPerPage, searchValue]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(0);
    }, [searchValue]);

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
            id: "fullName",
            label: "Nombre",
            size: "xl",
        },
        {
            id: "roleName",
            label: "Rol",
            size: "sm",
        },
        {
            id: "cellphone",
            label: "Celular",
            size: "sm",
        },
        {
            id: "branches",
            label: "Sucursales",
            type: "chipGroup",
            chipGroupKey: "name",
            chipGroupMaxVisible: 2,
            size: "xl"
        },
        {
            id: "status",
            label: "Estatus",
            type: "chip",
            size: "sm",
            chipLabelMap: ESTATUS_CHIP_LABELS,
            chipVariantMap: ESTATUS_CHIP_VARIANTS,
        },
        {
            id: "createdAt",
            label: "Fecha registro",
            type: "date",
            size: "sm",
        },
        {
            id: "updatedAt",
            label: "Últ. actualización",
            type: "date",
            size: "sm",
        }
    ];

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
            <Stack direction="column" spacing={3}>
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
            </Stack>

        </MainLayout>
    );
}
