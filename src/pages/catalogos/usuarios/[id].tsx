import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, Button, CircularProgress, Divider, Grid, Stack, Typography } from "@mui/material";
import {
    MainLayout,
    Breadcrumbs,
    FormTextField,
    FormSelect,
    MultiSelectChips,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { SelectableItem } from "@/components/MultiSelectChips";
import {
    FormCard,
    HelperTextLink
} from "@/styles/catalogos/usuarios.styles";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import {
    getUser as getUserApi,
    getRoles,
    getBranches,
    createUser,
    updateUser,
    type RoleItem,
    type BranchItem,
} from "@/services/users.service";
import { usePermissions } from "@/hooks/usePermissions";
import { CATALOG_USERS_CREATE, CATALOG_USERS_UPDATE } from "@/lib/permissions";

async function loadCatalogs() {
    const [rolesResult, branchesResult] = await Promise.all([
        getRoles(),
        getBranches(),
    ]);
    return { rolesResult, branchesResult };
}

async function loadUser(id: number) {
    return getUserApi(id);
}

const USERNAME_MAX_LENGTH = 6;

type UserFormState = {
    firstName: string;
    lastName: string;
    username: string;
    cellphone: string;
    password: string;
    roleId: number | "";
    branchIds: number[];
};

type UserFormErrors = Partial<Record<keyof UserFormState, string>>;

const initialUser: UserFormState = {
    firstName: "",
    lastName: "",
    username: "",
    cellphone: "",
    password: "",
    roleId: "",
    branchIds: [],
};

export default function UserFormPage() {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const { id } = router.query;

    const isNew = id === "nuevo";
    const canSaveUser = hasPermission(isNew ? CATALOG_USERS_CREATE : CATALOG_USERS_UPDATE);
    const userId = isNew ? null : Number(id);

    const [loading, setLoading] = useState(true);
    const [sendingInvite, setSendingInvite] = useState(false);

    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [branches, setBranches] = useState<BranchItem[]>([]);

    const [user, setUser] = useState<UserFormState>(initialUser);
    const [errors, setErrors] = useState<UserFormErrors>({});

    useAsyncEffect(async (isCancelled) => {
        const { rolesResult, branchesResult } = await loadCatalogs();
        if (isCancelled()) return;
        if (!rolesResult.error && rolesResult.data) setRoles(rolesResult.data);
        if (!branchesResult.error && branchesResult.data) setBranches(branchesResult.data);

        if (isNew) setLoading(false);
    }, [isNew]);

    useAsyncEffect(async (isCancelled) => {
        if (isNew || userId == null) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const result = await loadUser(userId);
        if (isCancelled()) return;
        if (!result.error && result.data) {
            const data = result.data;
            setUser({
                firstName: data.firstName ?? "",
                lastName: data.lastName ?? "",
                username: data.username ?? "",
                cellphone: data.cellphone ?? "",
                password: "",
                roleId: data.roleId,
                branchIds: data.branchIds,
            });
        }
        if (!isCancelled()) setLoading(false);
    }, [isNew, userId]);

    const setUserField = useCallback(<K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
        setUser((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    }, []);

    const validateForm = (): boolean => {
        const next: UserFormErrors = {};

        if (!user.firstName.trim()) {
            next.firstName = "El nombre es requerido";
        }

        if (!user.lastName.trim()) {
            next.lastName = "El apellido es requerido";
        }

        if (!user.username.trim()) {
            next.username = "El número de usuario es requerido";
        } else if (user.username.trim().length > USERNAME_MAX_LENGTH) {
            next.username = `Máximo ${USERNAME_MAX_LENGTH} caracteres`;
        }

        const trimmedPhone = user.cellphone.trim();
        if (!trimmedPhone) {
            next.cellphone = "El celular es requerido";
        } else if (trimmedPhone.length < 10) {
            next.cellphone = "Ingresa un número válido (mín. 10 dígitos)";
        }

        if (!user.roleId) {
            next.roleId = "Selecciona un rol";
        }

        if (user.branchIds.length === 0) {
            next.branchIds = "Selecciona al menos una sucursal";
        }

        if (isNew) {
            if (!user.password.trim()) {
                next.password = "La contraseña es requerida";
            } else if (user.password.trim().length < 10) {
                next.password = "Mínimo 10 caracteres";
            }
        }

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleConfirm = async () => {
        if (!validateForm()) return;

        setSendingInvite(true);
        const result = isNew
            ? await createUser({
                firstName: user.firstName.trim(),
                lastName: user.lastName.trim(),
                username: user.username.trim().slice(0, USERNAME_MAX_LENGTH),
                cellphone: user.cellphone.trim(),
                password: user.password.trim(),
                roleId: user.roleId as number,
                branchIds: user.branchIds,
            })
            : await updateUser(userId!, {
                firstName: user.firstName.trim(),
                lastName: user.lastName.trim(),
                username: user.username.trim().slice(0, USERNAME_MAX_LENGTH),
                cellphone: user.cellphone.trim(),
                roleId: user.roleId as number,
                branchIds: user.branchIds,
            });

        if (!result.error) {
            router.push("/catalogos/usuarios");
        }

        setSendingInvite(false);
    };

    const handleBranchChange = (selectedIds: (string | number)[]) => {
        setUserField("branchIds", selectedIds as number[]);
    };

    const branchItems: SelectableItem[] = branches.map((branch) => ({
        id: branch.id,
        label: branch.name,
    }));

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Usuarios", href: "/catalogos/usuarios" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

    const canSendInvite =
        user.firstName.trim().length > 0 &&
        user.lastName.trim().length > 0 &&
        user.username.trim().length > 0 &&
        user.username.trim().length <= USERNAME_MAX_LENGTH &&
        user.cellphone.trim().length >= 10 &&
        user.roleId !== "" &&
        user.branchIds.length > 0 &&
        (isNew ? user.password.trim().length >= 10 : true);

    if (loading) {
        return (
            <MainLayout>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: 400,
                    }}
                >
                    <CircularProgress />
                </Box>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <Stack spacing={3}>
                <Breadcrumbs items={breadcrumbItems} />
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">{isNew ? "Nuevo usuario" : "Editar usuario"}</Typography>
                    <Button
                        variant="contained"
                        onClick={handleConfirm}
                        disabled={!canSendInvite || sendingInvite || !canSaveUser}>
                        {
                            (sendingInvite) ?
                                <CircularProgress size={20} color="inherit" />
                                :
                                (isNew) ? "Enviar invitación" : "Guardar cambios"
                        }
                    </Button>
                </Stack>
                <Divider />
                <FormCard>
                    <Typography variant="subtitle2" fontWeight={600}>Datos generales</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormTextField
                                label="Nombre(s)"
                                placeholder="Ej. Juan"
                                value={user.firstName}
                                onChange={(e) => setUserField("firstName", e.target.value)}
                                error={Boolean(errors.firstName)}
                                helperText={errors.firstName || undefined}
                                autoFocus
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormTextField
                                label="Apellido(s)"
                                placeholder="Ej. Pérez García"
                                value={user.lastName}
                                onChange={(e) => setUserField("lastName", e.target.value)}
                                error={Boolean(errors.lastName)}
                                helperText={errors.lastName || undefined}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormTextField
                                label="Número de empleado"
                                placeholder="Máx. 6 caracteres"
                                value={user.username}
                                onChange={(e) =>
                                    setUserField("username", e.target.value.replace(/\D/g, "").slice(0, USERNAME_MAX_LENGTH))
                                }
                                error={Boolean(errors.username)}
                                helperText={errors.username || undefined}
                                inputProps={{ maxLength: USERNAME_MAX_LENGTH, inputMode: "numeric" }}
                            />
                        </Grid>
                        {
                            isNew &&
                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormTextField
                                    label="Contraseña"
                                    placeholder="Mínimo 10 caracteres"
                                    type="password"
                                    value={user.password}
                                    onChange={(e) => setUserField("password", e.target.value)}
                                    error={Boolean(errors.password)}
                                    helperText={errors.password || undefined}
                                />
                            </Grid>
                        }
                    </Grid>
                    <Divider />
                    <Typography variant="subtitle2" fontWeight={600}>Rol y contacto</Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormTextField
                                label="Celular"
                                placeholder="Ej. 8341234567"
                                required
                                value={user.cellphone}
                                onChange={(e) => setUserField("cellphone", e.target.value.replace(/\D/g, "").slice(0, 15))}
                                error={Boolean(errors.cellphone)}
                                helperText={errors.cellphone || undefined}
                                inputProps={{ inputMode: "tel", maxLength: 10 }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormSelect
                                label="Selecciona un rol"
                                placeholder="Selecciona un rol"
                                value={user.roleId}
                                onChange={(e) => setUserField("roleId", e.target.value === "" ? "" : Number(e.target.value))}
                                options={roles.map((role) => ({
                                    value: role.id,
                                    label: role.name,
                                }))}
                                error={Boolean(errors.roleId)}
                                helperText={errors.roleId || undefined}
                            />
                            <HelperTextLink>Si deseas crear un rol nuevo, ve hacia el módulo{" "}<Link href="/catalogos/roles">Roles</Link></HelperTextLink>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Typography variant="subtitle2" fontWeight={600}>Sucursal asignada</Typography>
                    <MultiSelectChips
                        items={branchItems}
                        selectedIds={user.branchIds}
                        onChange={handleBranchChange}
                        disabled={sendingInvite}
                        error={Boolean(errors.branchIds)}
                        helperText={errors.branchIds || undefined}
                    />
                </FormCard>
            </Stack>
        </MainLayout>
    );
}
