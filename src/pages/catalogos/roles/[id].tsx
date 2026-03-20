import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { Box, Button, CircularProgress, Divider, Grid, Stack, Typography } from "@mui/material";
import { MainLayout, Breadcrumbs, FormTextField, PermissionsTable } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { ModulePermission, Permission } from "@/components/PermissionsTable";
import { FormCard } from "@/styles/catalogos/roles.styles";
import {
  getRoleDetail,
  getPermissionsTemplate,
  createRole,
  updateRole,
  updateRolePermissions,
} from "@/services/roles.service";
import {
  apiModulesToTableModules,
  tableModulesToPayload,
  areModulesEqual,
} from "@/utils/role";
import type { PermissionsTemplateResponse } from "@/types/roles.types";

export default function RoleFormPage() {
  const router = useRouter();
  const { id } = router.query;

  const isNew = id === "nuevo";
  const roleId = isNew ? null : Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | undefined>();
  const [apiModules, setApiModules] = useState<PermissionsTemplateResponse>([]);
  const [tableModules, setTableModules] = useState<ModulePermission[]>([]);

  const initialDataRef = useRef<{
    name: string;
    description: string;
    tableModules: ModulePermission[];
  } | null>(null);

  useEffect(() => {
    if (isNew) {
      getPermissionsTemplate()
        .then((result) => {
          if (result.error) {
            console.error("[RoleForm] Error loading permissions template:", result.error.message);
            return;
          }
          if (result.data) {
            setApiModules(result.data);
            setTableModules(apiModulesToTableModules(result.data));
          }
        })
        .finally(() => setLoading(false));
      return;
    }
    if (!roleId || Number.isNaN(roleId)) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    getRoleDetail(roleId)
      .then((result) => {
        if (result.error) {
          console.error("[RoleForm] Error loading role:", result.error.message);
          return;
        }
        if (!result.data) return;
        const res = result.data;
        const roleName = res.role.name;
        const roleDescription = res.role.description ?? "";
        const modules = apiModulesToTableModules(res.modules);
        setName(roleName);
        setDescription(roleDescription);
        setApiModules(res.modules);
        setTableModules(modules);
        initialDataRef.current = {
          name: roleName,
          description: roleDescription,
          tableModules: modules,
        };
      })
      .finally(() => setLoading(false));
  }, [isNew, roleId]);

  const handlePermissionChange = useCallback(
    (moduleId: string, permission: keyof Permission, value: boolean) => {
      setTableModules((prev) =>
        prev.map((m) =>
          m.id === moduleId
            ? {
              ...m,
              permissions: {
                ...m.permissions,
                [permission]: value,
              },
            }
            : m,
        ),
      );
    },
    [],
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (nameError) setNameError(undefined);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

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

  const handleSave = async () => {
    if (!validateForm()) return;

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!isNew && roleId && initialDataRef.current) {
      const initial = initialDataRef.current;
      const nameUnchanged = trimmedName === initial.name;
      const descriptionUnchanged = trimmedDescription === initial.description;
      const permissionsUnchanged = areModulesEqual(tableModules, initial.tableModules);
      if (nameUnchanged && descriptionUnchanged && permissionsUnchanged) {
        router.push("/catalogos/roles");
        return;
      }
    }

    setSaving(true);
    if (isNew) {
      const created = await createRole({
        name: trimmedName,
        description: trimmedDescription || undefined,
      });
      if (created.error || !created.data) {
        setSaving(false);
        console.error("[RoleForm] Error saving:", created.error?.message);
        return;
      }
      const payload = tableModulesToPayload(apiModules, tableModules);
      const permResult = await updateRolePermissions(created.data.id, { permissions: payload });
      setSaving(false);
      if (permResult.error) {
        console.error("[RoleForm] Error saving permissions:", permResult.error.message);
        return;
      }
      router.push("/catalogos/roles");
    } else if (roleId) {
      const updateResult = await updateRole(roleId, {
        name: trimmedName,
        description: trimmedDescription || undefined,
      });
      if (updateResult.error) {
        setSaving(false);
        console.error("[RoleForm] Error saving:", updateResult.error.message);
        return;
      }
      const payload = tableModulesToPayload(apiModules, tableModules);
      const permResult = await updateRolePermissions(roleId, { permissions: payload });
      setSaving(false);
      if (permResult.error) {
        console.error("[RoleForm] Error saving permissions:", permResult.error.message);
        return;
      }
      router.push("/catalogos/roles");
    } else {
      setSaving(false);
    }
  };

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
      <Stack spacing={3}>
        <Breadcrumbs items={breadcrumbItems} />
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{isNew ? "Nuevo rol" : "Editar rol"}</Typography>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Guardar"}
          </Button>
        </Stack>
        <Divider />
        <FormCard>
          <Typography variant="subtitle2" fontWeight={600}>Datos generales</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                label="Nombre"
                placeholder="Ej. Administrador"
                value={name}
                onChange={handleNameChange}
                error={Boolean(nameError)}
                helperText={nameError}
                autoFocus
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                label="Descripción"
                placeholder="Opcional"
                value={description}
                onChange={handleDescriptionChange}
              />
            </Grid>
          </Grid>
          <Typography variant="subtitle2" fontWeight={600}>Permisos</Typography>
          <PermissionsTable
            modules={tableModules}
            onChange={handlePermissionChange}
            disabled={saving}
          />
        </FormCard>
      </Stack>
    </MainLayout>
  );
}
