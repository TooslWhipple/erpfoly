import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import {
    MainLayout,
    Breadcrumbs,
    FormTextField,
    FormSelect,
    MultiSelectChips,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { SelectableItem } from "@/components/MultiSelectChips";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface User {
    id: number;
    name: string;
    username: string;
    roleId: number;
    branchIds: number[];
}

interface Role {
    id: number;
    name: string;
}

interface Branch {
    id: number;
    name: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

const PageHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing(3),
    gap: theme.spacing(2),
}));

const PageTitle = styled(Typography)({
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#232325",
});

const SendInviteButton = styled(Button)(({ theme }) => ({
    height: 40,
    minWidth: 160,
    borderColor: colors.border,
    color: "#71717A",
    "&:hover": {
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        backgroundColor: "transparent",
    },
    "&.Mui-disabled": {
        borderColor: colors.border,
        color: "#D1D5DB",
    },
}));

const FormCard = styled(Paper)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(3),
    width: "100%",
    boxShadow: "none",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 600,
    color: "#232325",
    marginBottom: theme.spacing(2),
}));

const Section = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    "&:last-child": {
        marginBottom: 0,
    },
}));

const FieldsRow = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
        gridTemplateColumns: "1fr",
    },
}));

const HelperTextLink = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
    "& a": {
        color: theme.palette.primary.main,
        textDecoration: "none",
        fontWeight: 500,
        "&:hover": {
            textDecoration: "underline",
        },
    },
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const DUMMY_ROLES: Role[] = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Cajas" },
    { id: 3, name: "Gestor de rutas" },
    { id: 4, name: "Inventarios" },
    { id: 5, name: "Vendedor" },
    { id: 6, name: "Analista de crédito" },
    { id: 7, name: "Cobranza" },
    { id: 8, name: "Supervisor" },
];

const DUMMY_BRANCHES: Branch[] = [
    { id: 1, name: "Foly Muebles Tampico Centro" },
    { id: 2, name: "Foly Muebles Altamira" },
    { id: 3, name: "Foly Muebles Matriz" },
    { id: 4, name: "Foly Muebles Tampico Aeropuerto" },
    { id: 5, name: "Foly Muebles Avenida Monterrey" },
    { id: 6, name: "Foly Muebles Ejército Mexicano" },
    { id: 7, name: "Foly Muebles Bodega Tampico" },
    { id: 8, name: "Foly Muebles San Luis Potosí Carranza" },
    { id: 9, name: "Foly Muebles San Luis Potosí Soledad" },
    { id: 10, name: "Foly Muebles Poza Rica" },
    { id: 11, name: "Foly Muebles Pánuco" },
    { id: 12, name: "Foly Muebles Veracruz Puerto" },
    { id: 13, name: "Foly Muebles Coatzacualcos" },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getUser(id: number): Promise<User | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate existing user data
    if (id === 1) {
        return {
            id: 1,
            name: "Julio Armando López Inzunza",
            username: "julio.lopez",
            roleId: 1,
            branchIds: [1, 2, 3],
        };
    }

    if (id === 7) {
        return {
            id: 7,
            name: "Carlos Fuentes Macías",
            username: "carlos.fuentes",
            roleId: 6,
            branchIds: [1, 2],
        };
    }

    // For other IDs, return generic user
    return {
        id,
        name: `Usuario ${id}`,
        username: `usuario.${id}`,
        roleId: 5,
        branchIds: [1],
    };
}

async function saveUser(
    user: Omit<User, "id"> & { id?: number }
): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const savedUser: User = {
        id: user.id || Date.now(),
        name: user.name,
        username: user.username,
        roleId: user.roleId,
        branchIds: user.branchIds,
    };
    console.log("[API] Saved user:", savedUser);
    return savedUser;
}

async function sendInvitation(userId: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    console.log("[API] Sent invitation to user:", userId);
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
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [sendingInvite, setSendingInvite] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [roleId, setRoleId] = useState<number | "">("");
    const [branchIds, setBranchIds] = useState<number[]>([]);

    // Errors
    const [nameError, setNameError] = useState<string | undefined>();
    const [usernameError, setUsernameError] = useState<string | undefined>();
    const [roleError, setRoleError] = useState<string | undefined>();
    const [branchError, setBranchError] = useState<string | undefined>();

    // Fetch user data if editing
    useEffect(() => {
        if (isNew || !userId) {
            setLoading(false);
            return;
        }

        async function loadUser() {
            setLoading(true);
            try {
                const user = await getUser(userId!);
                if (user) {
                    setName(user.name);
                    setUsername(user.username);
                    setRoleId(user.roleId);
                    setBranchIds(user.branchIds);
                }
            } catch (err) {
                console.error("[UserForm] Error loading user:", err);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
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

        if (!roleId) {
            setRoleError("Selecciona un rol");
            isValid = false;
        }

        if (branchIds.length === 0) {
            setBranchError("Selecciona al menos una sucursal");
            isValid = false;
        }

        return isValid;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            await saveUser({
                id: userId || undefined,
                name: name.trim(),
                username: username.trim(),
                roleId: roleId as number,
                branchIds,
            });
            router.push("/catalogos/usuarios");
        } catch (err) {
            console.error("[UserForm] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    // Handle send invitation
    const handleSendInvitation = async () => {
        if (!validateForm()) return;

        setSendingInvite(true);
        try {
            // First save, then send invite
            const savedUser = await saveUser({
                id: userId || undefined,
                name: name.trim(),
                username: username.trim(),
                roleId: roleId as number,
                branchIds,
            });
            await sendInvitation(savedUser.id);
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
    const branchItems: SelectableItem[] = DUMMY_BRANCHES.map((branch) => ({
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
        roleId !== "" &&
        branchIds.length > 0;

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
                    </FieldsRow>
                </Section>

                {/* Role Section */}
                <Section>
                    <SectionTitle>Rol</SectionTitle>
                    <FormSelect
                        label="Selecciona un rol"
                        placeholder="Selecciona un rol"
                        value={roleId}
                        onChange={(e) => {
                            setRoleId(e.target.value as number);
                            if (roleError) setRoleError(undefined);
                        }}
                        options={DUMMY_ROLES.map((role) => ({
                            value: role.id,
                            label: role.name,
                        }))}
                        error={Boolean(roleError)}
                        helperText={roleError}
                    />
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
