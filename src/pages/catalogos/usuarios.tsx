import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Stack, Typography } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { KeyRound, Monitor, UserCheck, UserX } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
    Title,
    TableCrud,
    TabFilters,
    ItemNameHighlight,
    ModalFormZod,
    FormAutocomplete,
    ChipGroup,
} from "@/components";
import type { Column, RowAction, StatusChipVariant } from "@/components/TableCrud";
import {
    defineFormFields,
    type SchemaInputFromFields,
    type SchemaOutputFromFields,
} from "@/forms";
import {
    getUsers as getUsersApi,
    getUser as getUserApi,
    getBranches,
    resetUserAccess,
    updateUserStatus,
    type UserListItem,
} from "@/services/users.service";
import {
    assignCashRegisterToCashier,
    getCashRegistersCatalog,
} from "@/services/cash-registers-catalog.service";
import { formatListDateTime } from "@/utils/date";
import {
    CATALOG_USERS_CREATE,
    CATALOG_USERS_UPDATE,
    CASH_REGISTERS_UPDATE,
} from "@/lib/permissions";
import { ROLE_CODES } from "@/constants/role-codes";
import { useDebouncedInput } from "@/hooks/useDebouncedValue";
import { usePermissions } from "@/hooks/usePermissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { useConfirmationModal } from "@/hooks/useConfirmationModal";

type User = UserListItem;

const SEARCH_DEBOUNCE_MS = 300;
const CASH_REGISTERS_CATALOG_QUERY_KEY = ["catalog", "cash-registers"] as const;
const CASH_REGISTERS_LIST_QUERY_KEY = ["cash-registers"] as const;
const NONE_VALUE = "__none__";

type AssignCashRegisterFormShape = {
    cashRegisterId: string;
};

const assignCashRegisterFormFields = defineFormFields<AssignCashRegisterFormShape>()([
    {
        name: "cashRegisterId",
        schema: z.string().min(1, "Selecciona una caja"),
        label: "Caja",
        type: "text",
        placeholder: "Buscar caja",
    },
] as const);

type AssignCashRegisterFormOutput = SchemaOutputFromFields<
    typeof assignCashRegisterFormFields
>;

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
    const queryClient = useQueryClient();
    const { hasPermission } = usePermissions();
    const { showSuccess, showError } = useSnackbarStore();
    const { requestConfirmation, confirmationModal } = useConfirmationModal();
    const canAssignCashRegister =
        hasPermission(CATALOG_USERS_UPDATE) && hasPermission(CASH_REGISTERS_UPDATE);

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [searchInput, setSearchInput, debouncedSearch] = useDebouncedInput(
        "",
        SEARCH_DEBOUNCE_MS,
    );
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRows, setTotalRows] = useState(0);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

    const [assignState, setAssignState] = useState<
        { open: false } | { open: true; user: User }
    >({ open: false });
    const [assignSaving, setAssignSaving] = useState(false);
    const [assignRefreshing, setAssignRefreshing] = useState(false);
    const [assignFormCashRegisterId, setAssignFormCashRegisterId] = useState(NONE_VALUE);

    useEffect(() => {
        setSearchValue(debouncedSearch);
    }, [debouncedSearch]);

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

    // Refetch when returning from user edit so branchIds/caja stay current.
    useEffect(() => {
        const onRouteComplete = (url: string) => {
            if (url === "/catalogos/usuarios" || url.startsWith("/catalogos/usuarios?")) {
                void fetchUsers();
            }
        };
        router.events.on("routeChangeComplete", onRouteComplete);
        return () => {
            router.events.off("routeChangeComplete", onRouteComplete);
        };
    }, [router.events, fetchUsers]);

    const invalidateCashRegisterCaches = useCallback(async () => {
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: CASH_REGISTERS_CATALOG_QUERY_KEY }),
            queryClient.invalidateQueries({ queryKey: CASH_REGISTERS_LIST_QUERY_KEY }),
        ]);
    }, [queryClient]);

    const cashRegistersQuery = useQuery({
        queryKey: CASH_REGISTERS_CATALOG_QUERY_KEY,
        queryFn: getCashRegistersCatalog,
        staleTime: 0,
        enabled: assignState.open,
    });

    const assignUser = assignState.open ? assignState.user : null;
    const userBranchIds = assignUser?.branchIds ?? [];
    const userBranchNames = assignUser?.branches ?? [];

    const assignUserId = assignState.open ? assignState.user.id : null;
    const assignUserCashRegisterId = assignState.open
        ? assignState.user.cashRegisterId
        : null;
    const assignUserCashRegisterName = assignState.open
        ? assignState.user.cashRegisterName
        : null;

    // Prefer live catalog assignment over the (possibly stale) list row.
    useEffect(() => {
        if (assignUserId == null || !cashRegistersQuery.data) return;
        const assigned = cashRegistersQuery.data.find(
            (item) => item.userId === assignUserId,
        );
        const nextId = assigned?.id ?? null;
        const nextName = assigned?.name ?? null;
        if (
            nextId === assignUserCashRegisterId &&
            nextName === assignUserCashRegisterName
        ) {
            return;
        }
        setAssignState((prev) => {
            if (!prev.open || prev.user.id !== assignUserId) return prev;
            return {
                open: true,
                user: {
                    ...prev.user,
                    cashRegisterId: nextId,
                    cashRegisterName: nextName,
                },
            };
        });
        setAssignFormCashRegisterId(nextId != null ? String(nextId) : NONE_VALUE);
    }, [
        assignUserId,
        assignUserCashRegisterId,
        assignUserCashRegisterName,
        cashRegistersQuery.data,
    ]);

    const cashRegisterOptions = useMemo(() => {
        const catalog = cashRegistersQuery.data ?? [];
        const userBranchIdSet = new Set(userBranchIds);

        const sameBranch = catalog.filter((item) => userBranchIdSet.has(item.branchId));

        const available =
            assignUser?.cashRegisterId != null
                ? sameBranch.filter((item) => item.id === assignUser.cashRegisterId)
                : sameBranch.filter((item) => item.userId == null);

        return [
            { value: NONE_VALUE, label: "Sin caja" },
            ...available.map((item) => ({
                value: String(item.id),
                label: `${item.name} (${item.branchName})`,
            })),
        ];
    }, [cashRegistersQuery.data, assignUser?.cashRegisterId, userBranchIds]);

    const assignDefaultValues = useMemo<
        SchemaInputFromFields<typeof assignCashRegisterFormFields>
    >(
        () => ({
            cashRegisterId: assignUser?.cashRegisterId
                ? String(assignUser.cashRegisterId)
                : NONE_VALUE,
        }),
        [assignUser?.cashRegisterId],
    );

    const assignConfirmDisabled =
        assignUser?.cashRegisterId == null && assignFormCashRegisterId === NONE_VALUE;

    const handleSearchChange = (value: string) => {
        setSearchInput(value);
    };

    const handleCreateUser = () => {
        router.push("/catalogos/usuarios/nuevo");
    };

    const handleEditUser = (user: User) => {
        router.push(`/catalogos/usuarios/${user.id}`);
    };

    const handleOpenAssign = async (user: User) => {
        void queryClient.invalidateQueries({ queryKey: CASH_REGISTERS_CATALOG_QUERY_KEY });
        setAssignFormCashRegisterId(
            user.cashRegisterId != null ? String(user.cashRegisterId) : NONE_VALUE,
        );
        setAssignState({ open: true, user });
        setAssignRefreshing(true);

        try {
            const [detailResult, branchesResult, listResult] = await Promise.all([
                getUserApi(user.id),
                getBranches(),
                getUsersApi({
                    page: page + 1,
                    limit: rowsPerPage,
                    search: searchValue || undefined,
                }),
            ]);

            if (!listResult.error && listResult.data) {
                setUsers(listResult.data.rows);
                setTotalRows(listResult.data.total);
            }

            const fromList = listResult.data?.rows.find((row) => row.id === user.id);
            const detail = detailResult.error ? null : detailResult.data;
            if (!detail && !fromList) return;

            const branchIds = detail?.branchIds ?? fromList?.branchIds ?? user.branchIds;
            const branchNameById = new Map(
                (branchesResult.data ?? []).map((branch) => [branch.id, branch.name]),
            );
            const branches =
                detail != null
                    ? branchIds
                          .map((id) => branchNameById.get(id))
                          .filter((name): name is string => Boolean(name))
                    : (fromList?.branches ?? user.branches);

            const freshUser: User = {
                ...(fromList ?? user),
                branchIds,
                branches,
                cashRegisterId: fromList?.cashRegisterId ?? user.cashRegisterId,
                cashRegisterName: fromList?.cashRegisterName ?? user.cashRegisterName,
            };

            setAssignFormCashRegisterId(
                freshUser.cashRegisterId != null
                    ? String(freshUser.cashRegisterId)
                    : NONE_VALUE,
            );
            setAssignState((prev) => {
                if (!prev.open || prev.user.id !== user.id) return prev;
                return { open: true, user: freshUser };
            });
        } finally {
            setAssignRefreshing(false);
        }
    };

    const handleCloseAssign = () => {
        if (assignSaving || assignRefreshing) return;
        setAssignState({ open: false });
    };

    const handleAssignSubmit = async (value: AssignCashRegisterFormOutput) => {
        if (!assignUser) return;

        const selectedId =
            value.cashRegisterId === NONE_VALUE ? null : Number(value.cashRegisterId);
        const currentId = assignUser.cashRegisterId;

        if (selectedId == null && currentId == null) {
            showError("Selecciona una caja para asignar");
            return;
        }

        if (selectedId === currentId) {
            setAssignState({ open: false });
            return;
        }

        if (currentId != null && selectedId != null && selectedId !== currentId) {
            showError(
                "El cajero ya tiene una caja asignada. Desasígnala primero con «Sin caja».",
            );
            return;
        }

        if (selectedId != null && assignUser.branchIds.length === 0) {
            showError("El cajero no tiene una sucursal asignada");
            return;
        }

        setAssignSaving(true);

        if (selectedId == null && currentId != null) {
            const result = await assignCashRegisterToCashier(currentId, {
                user_id: null,
            });
            setAssignSaving(false);
            if (result.error) {
                showError(result.error.message);
                return;
            }
            setAssignState({ open: false });
            showSuccess("Caja desasignada correctamente");
            await invalidateCashRegisterCaches();
            fetchUsers();
            return;
        }

        if (selectedId != null) {
            const result = await assignCashRegisterToCashier(selectedId, {
                user_id: assignUser.id,
            });
            setAssignSaving(false);
            if (result.error) {
                showError(result.error.message);
                return;
            }
            setAssignState({ open: false });
            showSuccess("Caja asignada correctamente");
            await invalidateCashRegisterCaches();
            fetchUsers();
            return;
        }

        setAssignSaving(false);
        showError("Selecciona una caja para asignar");
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

    const noBranchHelper =
        userBranchIds.length === 0
            ? "El cajero no tiene sucursal; no hay cajas disponibles para asignar."
            : cashRegisterOptions.length <= 1
              ? "No hay cajas libres en las sucursales del cajero."
              : assignConfirmDisabled
                ? "Debes elegir una caja; un cajero solo puede tener una."
                : "Un cajero solo puede tener una caja asignada.";

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
            size: "xl",
        },
        {
            id: "cashRegisterName",
            label: "Caja",
            size: "md",
            format: (value) => (
                <Typography variant="body2" color={value ? "text.primary" : "text.secondary"}>
                    {(value as string | null) ?? "Sin asignar"}
                </Typography>
            ),
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
        },
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
            id: "assign-cash-register",
            label: "Asignar caja",
            icon: <Monitor size={16} />,
            onClick: handleOpenAssign,
            permission: CASH_REGISTERS_UPDATE,
            hidden: (row) =>
                row.roleCode !== ROLE_CODES.CAJERO || !canAssignCashRegister,
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
                    activeTab={""}
                    onTabChange={() => {}}
                    showSearch
                    searchValue={searchInput}
                    onSearchChange={handleSearchChange}
                    actions={[
                        {
                            label: "Nuevo",
                            onClick: handleCreateUser,
                            permission: CATALOG_USERS_CREATE,
                        },
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

            <ModalFormZod
                key={
                    assignState.open
                        ? `assign-${assignState.user.id}-${assignState.user.cashRegisterId ?? "none"}`
                        : "assign-closed"
                }
                open={assignState.open}
                onClose={handleCloseAssign}
                title={assignUser ? `Asignar caja — ${assignUser.fullName}` : "Asignar caja"}
                description="Un cajero solo puede tener una caja asignada, aunque tenga varias sucursales."
                fields={assignCashRegisterFormFields}
                defaultValues={assignDefaultValues}
                defaultValuesKey={
                    assignState.open
                        ? `${assignState.user.id}-${assignState.user.cashRegisterId ?? "none"}-${assignState.user.branchIds.join(",")}`
                        : "closed"
                }
                onSubmit={handleAssignSubmit}
                onValuesChange={(values) => {
                    const next = values.cashRegisterId;
                    setAssignFormCashRegisterId(
                        typeof next === "string" || typeof next === "number"
                            ? String(next)
                            : NONE_VALUE,
                    );
                }}
                loading={assignSaving || assignRefreshing || cashRegistersQuery.isPending}
                confirmDisabled={assignConfirmDisabled}
                confirmLabel="Guardar"
                maxWidth="sm"
                fullWidth
                validateOn="submit"
                allowInvalidSubmit
                customFieldLayout
            >
                {({ form }) => (
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {userBranchNames.length > 0 && (
                            <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                    Sucursales del cajero:
                                </Typography>
                                <ChipGroup items={userBranchNames} maxVisible={6} />
                            </Stack>
                        )}
                        <form.Field name="cashRegisterId">
                            {(field) => {
                                const fieldValue =
                                    typeof field.state.value === "string" ||
                                    typeof field.state.value === "number"
                                        ? field.state.value
                                        : "";
                                const hasError = !field.state.meta.isValid;
                                const errorMessage = Array.isArray(field.state.meta.errors)
                                    ? (field.state.meta.errors as string[]).join(", ")
                                    : field.state.meta.errors != null
                                      ? String(field.state.meta.errors)
                                      : undefined;
                                return (
                                    <FormAutocomplete
                                        label="Caja"
                                        placeholder="Buscar caja"
                                        options={cashRegisterOptions}
                                        value={fieldValue}
                                        onChange={(next) => field.handleChange(next)}
                                        onBlur={field.handleBlur}
                                        error={hasError}
                                        helperText={hasError ? errorMessage : noBranchHelper}
                                        disabled={
                                            assignSaving ||
                                            assignRefreshing ||
                                            cashRegistersQuery.isPending
                                        }
                                        noOptionsText="Sin cajas en las sucursales del cajero"
                                    />
                                );
                            }}
                        </form.Field>
                    </Stack>
                )}
            </ModalFormZod>

            {confirmationModal}
        </>
    );
}
