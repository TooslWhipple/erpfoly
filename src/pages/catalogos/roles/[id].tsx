import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";
import {
    MainLayout,
    Breadcrumbs,
    FormTextField,
    PermissionsTable,
} from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { ModulePermission, Permission } from "@/components/PermissionsTable";
import {
    BreadcrumbsContainer,
    PageHeader,
    HeaderLeft,
    PageTitle,
    SaveButton,
    FormCard,
    SectionTitle,
    Section,
    FieldContainer,
} from "@/styles/catalogos/roles.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Role {
    id: number;
    name: string;
    permissions: ModulePermission[];
}

// ============================================================================
// MOCK DATA - System modules for permissions
// ============================================================================

const SYSTEM_MODULES: Omit<ModulePermission, "permissions">[] = [
    { id: "credit_requests", name: "Solicitudes de crédito" },
    { id: "cashiers", name: "Cajas" },
    { id: "customers", name: "Clientes" },
    { id: "orders", name: "Pedidos" },
    { id: "branch_orders", name: "Pedidos (Sucursales)" },
    { id: "branch_requests", name: "Solicitudes (Sucursales)" },
    { id: "inventory", name: "Inventario" },
    { id: "customer_service", name: "Atención al cliente" },
    { id: "routes", name: "Rutas" },
    { id: "catalogs", name: "Catálogos" },
    { id: "reports", name: "Reportes" },
    { id: "settings", name: "Configuración" },
];

const DEFAULT_PERMISSIONS: Permission = {
    view: false,
    create: false,
    edit: false,
    delete: false,
};

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

async function getRole(id: number): Promise<Role | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate existing role data
    if (id === 1) {
        return {
            id: 1,
            name: "Administrador",
            permissions: SYSTEM_MODULES.map((module) => ({
                ...module,
                permissions: { view: true, create: true, edit: true, delete: true },
            })),
        };
    }

    if (id === 2) {
        return {
            id: 2,
            name: "Vendedor",
            permissions: SYSTEM_MODULES.map((module) => ({
                ...module,
                permissions: {
                    view: ["customers", "orders", "inventory"].includes(module.id),
                    create: ["orders"].includes(module.id),
                    edit: ["orders"].includes(module.id),
                    delete: false,
                },
            })),
        };
    }

    if (id === 6) {
        return {
            id: 6,
            name: "Cajas",
            permissions: SYSTEM_MODULES.map((module) => ({
                ...module,
                permissions: {
                    view: ["cashiers", "customers"].includes(module.id),
                    create: ["cashiers", "customers"].includes(module.id),
                    edit: ["cashiers", "customers"].includes(module.id),
                    delete: ["cashiers", "customers"].includes(module.id),
                },
            })),
        };
    }

    // For other IDs, return generic role
    return {
        id,
        name: `Rol ${id}`,
        permissions: SYSTEM_MODULES.map((module) => ({
            ...module,
            permissions: { ...DEFAULT_PERMISSIONS },
        })),
    };
}

async function saveRole(role: Omit<Role, "id"> & { id?: number }): Promise<Role> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const savedRole: Role = {
        id: role.id || Date.now(),
        name: role.name,
        permissions: role.permissions,
    };
    console.log("[API] Saved role:", savedRole);
    return savedRole;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RoleFormPage() {
    const router = useRouter();
    const { id } = router.query;

    // Determine if creating or editing
    const isNew = id === "nuevo";
    const roleId = isNew ? null : Number(id);

    // State
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState<string | undefined>();
    const [permissions, setPermissions] = useState<ModulePermission[]>(
        SYSTEM_MODULES.map((module) => ({
            ...module,
            permissions: { ...DEFAULT_PERMISSIONS },
        }))
    );

    // Fetch role data if editing
    useEffect(() => {
        if (isNew || !roleId) {
            setLoading(false);
            return;
        }

        async function loadRole() {
            setLoading(true);
            try {
                const role = await getRole(roleId!);
                if (role) {
                    setName(role.name);
                    setPermissions(role.permissions);
                }
            } catch (err) {
                console.error("[RoleForm] Error loading role:", err);
            } finally {
                setLoading(false);
            }
        }

        loadRole();
    }, [isNew, roleId]);

    // Handle permission change
    const handlePermissionChange = useCallback(
        (moduleId: string, permission: keyof Permission, value: boolean) => {
            setPermissions((prev) =>
                prev.map((module) =>
                    module.id === moduleId
                        ? {
                            ...module,
                            permissions: {
                                ...module.permissions,
                                [permission]: value,
                            },
                        }
                        : module
                )
            );
        },
        []
    );

    // Handle name change
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (nameError) {
            setNameError(undefined);
        }
    };

    // Validate form
    const validateForm = (): boolean => {
        if (!name.trim()) {
            setNameError("El nombre es requerido");
            return false;
        }
        if (name.trim().length < 3) {
            setNameError("El nombre debe tener al menos 3 caracteres");
            return false;
        }
        return true;
    };

    // Handle save
    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            await saveRole({
                id: roleId || undefined,
                name: name.trim(),
                permissions,
            });
            router.push("/catalogos/roles");
        } catch (err) {
            console.error("[RoleForm] Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    // Breadcrumbs
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: "Roles", href: "/catalogos/roles" },
        { label: isNew ? "Nuevo" : "Editar" },
    ];

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
                <HeaderLeft>
                    <PageTitle>{isNew ? "Nuevo rol" : "Editar rol"}</PageTitle>
                </HeaderLeft>
                <SaveButton
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
                </SaveButton>
            </PageHeader>

            <FormCard>
                <Section>
                    <SectionTitle>Datos generales</SectionTitle>
                    <FieldContainer>
                        <FormTextField
                            label="Nombre"
                            placeholder="Ej. Administrador"
                            value={name}
                            onChange={handleNameChange}
                            error={Boolean(nameError)}
                            helperText={nameError}
                            autoFocus
                        />
                    </FieldContainer>
                </Section>

                <Section>
                    <SectionTitle>Permisos</SectionTitle>
                    <PermissionsTable
                        modules={permissions}
                        onChange={handlePermissionChange}
                        disabled={saving}
                    />
                </Section>
            </FormCard>
        </MainLayout>
    );
}
