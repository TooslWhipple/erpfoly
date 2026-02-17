import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Box, CircularProgress } from "@mui/material";
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
    BreadcrumbsContainer,
    PageHeader,
    PageTitle,
    SendInviteButton,
    FormCard,
    SectionTitle,
    Section,
    FieldsRow,
    HelperTextLink,
} from "@/styles/catalogos/usuarios.styles";
import {
    getUser as getUserApi,
    getRoles,
    getBranches,
    createUser,
    updateUser,
    type RoleItem,
    type BranchItem,
} from "@/services/users.service";

// ============================================================================
// HELPERS
// ============================================================================

function nameToFirstLast(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UserFormPage() {
    const router = useRouter();
    const { id } = router.query;

    // Determine if creating or editing
    const isNew = id === "nuevo";
    const userId = isNew ? null : Number(id);

    // State
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingInvite, setSendingInvite] = useState(false);

    // Catalog data
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [branches, setBranches] = useState<BranchItem[]>([]);

    // Form state
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState<number | "">("");
    const [branchIds, setBranchIds] = useState<number[]>([]);

    // Errors
    const [nameError, setNameError] = useState<string | undefined>();
    const [usernameError, setUsernameError] = useState<string | undefined>();
    const [phoneError, setPhoneError] = useState<string | undefined>();
    const [passwordError, setPasswordError] = useState<string | undefined>();
    const [roleError, setRoleError] = useState<string | undefined>();
    const [branchError, setBranchError] = useState<string | undefined>();

    // Load roles and branches
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [rolesRes, branchesRes] = await Promise.all([
                    getRoles(),
                    getBranches(),
                ]);
                if (!cancelled) {
                    setRoles(rolesRes);
                    setBranches(branchesRes);
                    if (isNew) setLoading(false);
                }
            } catch (err) {
                console.error("[UserForm] Error loading catalog:", err);
                if (!cancelled && isNew) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isNew]);

    // Fetch user data if editing
    useEffect(() => {
        if (isNew || !userId) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const user = await getUserApi(userId!);
                if (!cancelled && user) {
                    setName(user.name);
                    setUsername(user.username);
                    setPhone(user.phone ?? "");
                    setRoleId(user.roleId);
                    setBranchIds(user.branchIds);
                }
            } catch (err) {
                console.error("[UserForm] Error loading user:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isNew, userId]);

    // Auto-generate username from name
    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newName = e.target.value;
            setName(newName);
            if (nameError) setNameError(undefined);

            // Auto-generate username if creating new user
            if (isNew && newName.trim()) {
                const parts = newName.toLowerCase().trim().split(" ");
                if (parts.length >= 2) {
                    const generatedUsername = `${parts[0]}.${parts[parts.length - 1]}`;
                    setUsername(generatedUsername.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
                }
            }
        },
        [isNew, nameError]
    );

    // Validate form
    const validateForm = (): boolean => {
        let isValid = true;

        if (!name.trim()) {
            setNameError("El nombre es requerido");
            isValid = false;
        } else if (name.trim().length < 3) {
            setNameError("El nombre debe tener al menos 3 caracteres");
            isValid = false;
        }

        if (!username.trim()) {
            setUsernameError("El usuario es requerido");
            isValid = false;
        } else if (username.trim().length < 3) {
            setUsernameError("El usuario debe tener al menos 3 caracteres");
            isValid = false;
        }

        const trimmedPhone = phone.trim();
        if (!trimmedPhone) {
            setPhoneError("El celular es requerido");
            isValid = false;
        } else if (trimmedPhone.length < 10) {
            setPhoneError("Ingresa un número válido (mín. 10 dígitos)");
            isValid = false;
        }

        if (!roleId) {
            setRoleError("Selecciona un rol");
            isValid = false;
        }

        if (branchIds.length === 0) {
            setBranchError("Selecciona al menos una sucursal");
            isValid = false;
        }

        if (isNew) {
            if (!password.trim()) {
                setPasswordError("La contraseña es requerida");
                isValid = false;
            } else if (password.trim().length < 10) {
                setPasswordError("Mínimo 10 caracteres");
                isValid = false;
            }
        }

        return isValid;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) return;

        const { firstName, lastName } = nameToFirstLast(name);
        setSaving(true);
        try {
            if (isNew) {
                await createUser({
                    firstName,
                    lastName,
                    username: username.trim(),
                    phone: phone.trim(),
                    password: password.trim(),
                    roleId: roleId as number,
                    branchIds,
                });
            } else {
                await updateUser(userId!, {
                    firstName,
                    lastName,
                    username: username.trim(),
                    phone: phone.trim(),
                    roleId: roleId as number,
                    branchIds,
                });
            }
            router.push("/catalogos/usuarios");
        } catch (err) {
            console.error("[UserForm] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    // Handle send invitation (save then redirect)
    const handleSendInvitation = async () => {
        if (!validateForm()) return;

        const { firstName, lastName } = nameToFirstLast(name);
        setSendingInvite(true);
        try {
            if (isNew) {
                await createUser({
                    firstName,
                    lastName,
                    username: username.trim(),
                    phone: phone.trim(),
                    password: password.trim(),
                    roleId: roleId as number,
                    branchIds,
                });
            } else {
                await updateUser(userId!, {
                    firstName,
                    lastName,
                    username: username.trim(),
                    phone: phone.trim(),
                    roleId: roleId as number,
                    branchIds,
                });
            }
            router.push("/catalogos/usuarios");
        } catch (err) {
            console.error("[UserForm] Error sending invitation:", err);
        } finally {
            setSendingInvite(false);
        }
    };

    // Handle branch selection change
    const handleBranchChange = (selectedIds: (string | number)[]) => {
        setBranchIds(selectedIds as number[]);
        if (branchError && selectedIds.length > 0) {
            setBranchError(undefined);
        }
    };

    // Transform branches to selectable items
    const branchItems: SelectableItem[] = branches.map((branch) => ({
        id: branch.id,
        label: branch.name,
    }));

    // Breadcrumbs
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Usuarios", href: "/catalogos/usuarios" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

    // Check if form has required data to enable invite button
    const canSendInvite =
        name.trim().length >= 3 &&
        username.trim().length >= 3 &&
        phone.trim().length >= 10 &&
        roleId !== "" &&
        branchIds.length > 0 &&
        (isNew ? password.trim().length >= 10 : true);

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
            <BreadcrumbsContainer>
                <Breadcrumbs items={breadcrumbItems} />
            </BreadcrumbsContainer>

            <PageHeader>
                <PageTitle>{isNew ? "Nuevo usuario" : "Editar usuario"}</PageTitle>
                <SendInviteButton
                    variant="outlined"
                    onClick={handleSendInvitation}
                    disabled={!canSendInvite || sendingInvite || saving}
                >
                    {sendingInvite ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        "Enviar invitación"
                    )}
                </SendInviteButton>
            </PageHeader>

            <FormCard>
                {/* General Data Section */}
                <Section>
                    <SectionTitle>Datos generales</SectionTitle>
                    <FieldsRow>
                        <FormTextField
                            label="Nombre"
                            placeholder="Ej. Juan Pérez García"
                            value={name}
                            onChange={handleNameChange}
                            error={Boolean(nameError)}
                            helperText={nameError}
                            autoFocus
                        />
                        <FormTextField
                            label="Usuario"
                            placeholder="Ej. juan.perez"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                if (usernameError) setUsernameError(undefined);
                            }}
                            error={Boolean(usernameError)}
                            helperText={usernameError}
                        />
                        {isNew && (
                            <FormTextField
                                label="Contraseña"
                                placeholder="Mínimo 10 caracteres"
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (passwordError) setPasswordError(undefined);
                                }}
                                error={Boolean(passwordError)}
                                helperText={passwordError}
                            />
                        )}
                    </FieldsRow>
                </Section>

                {/* Role and phone Section */}
                <Section>
                    <SectionTitle>Rol y contacto</SectionTitle>
                    <FieldsRow>
                        <FormTextField
                            label="Celular"
                            placeholder="Ej. 8341234567"
                            required
                            value={phone}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                                setPhone(value);
                                if (phoneError) setPhoneError(undefined);
                            }}
                            error={Boolean(phoneError)}
                            helperText={phoneError}
                            inputProps={{ inputMode: "tel", maxLength: 15 }}
                        />
                        <FormSelect
                            label="Selecciona un rol"
                            placeholder="Selecciona un rol"
                            value={roleId}
                            onChange={(e) => {
                                setRoleId(e.target.value as number);
                                if (roleError) setRoleError(undefined);
                            }}
                            options={roles.map((role) => ({
                                value: role.id,
                                label: role.name,
                            }))}
                            error={Boolean(roleError)}
                            helperText={roleError}
                        />
                    </FieldsRow>
                    <HelperTextLink>
                        Si deseas crear un rol nuevo, ve hacia el módulo{" "}
                        <Link href="/catalogos/roles">Roles</Link>
                    </HelperTextLink>
                </Section>

                {/* Branch Section */}
                <Section>
                    <SectionTitle>Sucursal</SectionTitle>
                    <MultiSelectChips
                        label="Sucursal asignada"
                        items={branchItems}
                        selectedIds={branchIds}
                        onChange={handleBranchChange}
                        disabled={saving || sendingInvite}
                        error={Boolean(branchError)}
                        helperText={branchError}
                    />
                </Section>
            </FormCard>
        </MainLayout>
    );
}
