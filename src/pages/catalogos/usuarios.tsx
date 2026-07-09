import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Stack } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { KeyRound, UserCheck, UserX } from "lucide-react";
import { Title, TableCrud, TabFilters, ItemNameHighlight } from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import {
    getUsers as getUsersApi,
    resetUserAccess,
    updateUserStatus,
    type UserListItem,
} from "@/services/users.service";
import { formatListDateTime } from "@/utils/date";
import { CATALOG_USERS_CREATE, CATALOG_USERS_UPDATE } from "@/lib/permissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";

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
    const { showSuccess, showError } = useSnackbarStore();
    const { requestConfirmation, confirmationModal } = useConfirmationModal();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

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

    const handleSearchChange = (value: string) => {
        setSearchValue(value);
    };

    const handleCreateUser = () => {
        router.push("/catalogos/usuarios/nuevo");
    };

    const handleEditUser = (user: User) => {
        router.push(`/catalogos/usuarios/${user.id}`);
    };

    const handleResetAccess = (user: User) => {
        const displayName = user.fullName ?? user.username;

        requestConfirmation({
            title: "Reiniciar acceso",
            type: "warning",
            confirmLabel: "Reiniciar acceso",
            cancelLabel: "Cancelar",
            description: (
                <>
                    Se enviará una contraseña temporal por WhatsApp a{" "}
                    <ItemNameHighlight>{displayName}</ItemNameHighlight>. La contraseña actual
                    dejará de funcionar.
                </>
            ),
            onConfirm: async () => {
                setActionLoadingId(user.id);
                const result = await resetUserAccess(user.id);
                setActionLoadingId(null);

                if (result.error) {
                    showError(result.error.message);
                    throw result.error;
                }

                showSuccess(result.data?.message ?? "Acceso reiniciado correctamente.");
            },
        });
    };

    const handleToggleStatus = (user: User) => {
        const isActive = user.status === "ACTIVE";
        const displayName = user.fullName ?? user.username;

        requestConfirmation({
            title: isActive ? "Desactivar usuario" : "Activar usuario",
            type: isActive ? "error" : "success",
            confirmLabel: isActive ? "Desactivar" : "Activar",
            cancelLabel: "Cancelar",
            description: isActive ? (
                <>
                    <ItemNameHighlight>{displayName}</ItemNameHighlight> no podrá acceder al
                    sistema hasta que lo reactives.
                </>
            ) : (
                <>
                    ¿Activar a <ItemNameHighlight>{displayName}</ItemNameHighlight>? Podrá volver
                    a acceder al sistema.
                </>
            ),
            onConfirm: async () => {
                setActionLoadingId(user.id);
                const result = await updateUserStatus(user.id, isActive ? "INACTIVE" : "ACTIVE");
                setActionLoadingId(null);

                if (result.error) {
                    showError(result.error.message);
                    throw result.error;
                }

                showSuccess(result.data?.message ?? "Estatus actualizado correctamente.");
                fetchUsers();
            },
        });
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
            size: "sm",
            format: (value) => formatListDateTime(value as string | null | undefined),
        },
        {
            id: "updatedAt",
            label: "Últ. actualización",
            size: "sm",
            format: (value) => formatListDateTime(value as string | null | undefined),
        }
    ];

    const actions: RowAction<User>[] = [
        {
            id: "edit",
            label: "Editar",
            icon: <EditIcon fontSize="small" />,
            onClick: handleEditUser,
            permission: CATALOG_USERS_UPDATE,
        },
        {
            id: "reset-access",
            label: "Reiniciar acceso",
            icon: <KeyRound size={16} />,
            onClick: handleResetAccess,
            permission: CATALOG_USERS_UPDATE,
            hidden: (row) => row.rolePlatform === "INTERNAL",
            disabled: (row) => actionLoadingId === row.id || row.status !== "ACTIVE",
        },
        {
            id: "deactivate",
            label: "Desactivar",
            icon: <UserX size={16} />,
            onClick: handleToggleStatus,
            permission: CATALOG_USERS_UPDATE,
            disabled: (row) => actionLoadingId === row.id || row.status !== "ACTIVE",
            color: "error",
        },
        {
            id: "activate",
            label: "Activar",
            icon: <UserCheck size={16} />,
            onClick: handleToggleStatus,
            permission: CATALOG_USERS_UPDATE,
            disabled: (row) => actionLoadingId === row.id || row.status === "ACTIVE",
        },
    ];

    return (
        <>
            <Stack direction="column" spacing={3}>
                <Title title="Usuarios" />
                <TabFilters
                    tabs={[]}
                    activeTab={''}
                    onTabChange={() => { }}
                    showSearch
                    searchValue={searchValue}
                    onSearchChange={handleSearchChange}
                    actions={[
                        {
                            label: "Nuevo",
                            onClick: handleCreateUser,
                            permission: CATALOG_USERS_CREATE,
                        }
                    ]}
                />
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
            {confirmationModal}
        </>
    );
}
