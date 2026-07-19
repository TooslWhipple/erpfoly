import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import {
  Breadcrumbs,
  FormTextField,
  FormSelect,
  MultiSelectChips,
} from "@/components";
import {
  UserDriverFields,
  initialDriverForm,
  type DriverFormState,
  type DriverFormErrors,
} from "@/components/UserDriverFields";
import type { UserDriverDetailsPayload } from "@/services/users.service";
import {
  ROLE_CODES,
  isDriverRoleCode,
  isHighPrivilegeRoleCode,
} from "@/constants/role-codes";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import type { SelectableItem } from "@/components/MultiSelectChips";
import { FormCard, HelperTextLink } from "@/styles/catalogos/usuarios.styles";
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
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { CATALOG_USERS_CREATE, CATALOG_USERS_UPDATE } from "@/lib/permissions";
import {
  filters,
  isValidPersonName,
  NAME_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from "@/forms/validation/filters";
import { useUsernameAvailability } from "@/hooks/users/useUsernameAvailability";
const personNameFilter = filters.personName();
async function loadCatalogs() {
  const [rolesResult, branchesResult] = await Promise.all([
    getRoles(),
    getBranches(),
  ]);
  return {
    rolesResult,
    branchesResult,
  };
}
async function loadUser(id: number) {
  return getUserApi(id);
}
type UserFormState = {
  firstName: string;
  lastName: string;
  username: string;
  cellphone: string;
  roleId: number | "";
  branchIds: number[];
  requiresOtp: boolean;
};
type UserFormErrors = Partial<Record<keyof UserFormState, string>>;
const initialUser: UserFormState = {
  firstName: "",
  lastName: "",
  username: "",
  cellphone: "",
  roleId: "",
  branchIds: [],
  requiresOtp: true,
};
export default function UserFormPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { showSuccess, showError } = useSnackbarStore();
  const { id } = router.query;
  const isNew = id === "nuevo";
  const canSaveUser = hasPermission(
    isNew ? CATALOG_USERS_CREATE : CATALOG_USERS_UPDATE,
  );
  const userId = isNew ? null : Number(id);
  const [loading, setLoading] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [user, setUser] = useState<UserFormState>(initialUser);
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [driverForm, setDriverForm] =
    useState<DriverFormState>(initialDriverForm);
  const [driverErrors, setDriverErrors] = useState<DriverFormErrors>({});
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const selectedRole = roles.find((role) => role.id === user.roleId);
  const selectedRoleCode = selectedRole?.code;
  const usernameChanged =
    isNew ||
    (savedUsername !== null && user.username.trim() !== savedUsername.trim());
  const { exists: usernameExists, isChecking: isCheckingUsername } =
    useUsernameAvailability(user.username, {
      excludeUserId: userId,
      enabled: !loading && usernameChanged,
    });
  useAsyncEffect(
    async (isCancelled) => {
      const { rolesResult, branchesResult } = await loadCatalogs();
      if (isCancelled()) return;
      if (!rolesResult.error && rolesResult.data) setRoles(rolesResult.data);
      if (!branchesResult.error && branchesResult.data)
        setBranches(branchesResult.data);
      if (isNew) setLoading(false);
    },
    [isNew],
  );
  useAsyncEffect(
    async (isCancelled) => {
      if (isNew || userId == null) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const result = await loadUser(userId);
      if (isCancelled()) return;
      if (!result.error && result.data) {
        const data = result.data;
        const loadedUsername = data.username ?? "";
        setSavedUsername(loadedUsername);
        setUser({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          username: loadedUsername,
          cellphone: data.cellphone ?? "",
          roleId: data.roleId,
          branchIds: data.branchIds,
          requiresOtp: data.requiresOtp,
        });
        if (data.driverDetails) {
          setDriverForm({
            licenseNumber: data.driverDetails.licenseNumber ?? "",
            postalCode: data.driverDetails.address?.postalCode ?? "",
            neighborhoodFullCode:
              data.driverDetails.address?.neighborhoodFullCode ?? "-1",
            state: "",
            city: "",
            street: data.driverDetails.address?.street ?? "",
            externalNumber: data.driverDetails.address?.externalNumber ?? "",
            internalNumber: data.driverDetails.address?.internalNumber ?? "",
          });
        }
      }
      if (!isCancelled()) setLoading(false);
    },
    [isNew, userId],
  );
  const setUserField = useCallback(
    <K extends keyof UserFormState>(key: K, value: UserFormState[K]) => {
      setUser((prev) => ({
        ...prev,
        [key]: value,
      }));
      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    },
    [],
  );
  const setDriverField = useCallback(
    <K extends keyof DriverFormState>(key: K, value: DriverFormState[K]) => {
      setDriverForm((prev) => ({
        ...prev,
        [key]: value,
      }));
      setDriverErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    },
    [],
  );
  const mergeDriverPatch = useCallback((patch: Partial<DriverFormState>) => {
    setDriverForm((prev) => ({
      ...prev,
      ...patch,
    }));
    setDriverErrors((prev) => {
      const next = {
        ...prev,
      };
      for (const key of Object.keys(patch) as Array<keyof DriverFormState>) {
        next[key] = "";
      }
      return next;
    });
  }, []);
  const buildDriverDetailsPayload = ():
    UserDriverDetailsPayload | undefined => {
    if (!isDriverRoleCode(selectedRoleCode)) return undefined;
    const payload: UserDriverDetailsPayload = {
      licenseNumber: driverForm.licenseNumber.trim().toUpperCase(),
    };
    if (selectedRoleCode === ROLE_CODES.CHOFER) {
      payload.address = {
        postalCode: driverForm.postalCode.trim(),
        neighborhoodFullCode: driverForm.neighborhoodFullCode,
        street: driverForm.street.trim(),
        externalNumber: driverForm.externalNumber.trim(),
        internalNumber: driverForm.internalNumber.trim() || undefined,
      };
    }
    return payload;
  };
  const validateDriverForm = (): boolean => {
    if (!isDriverRoleCode(selectedRoleCode)) {
      setDriverErrors({});
      return true;
    }
    const next: DriverFormErrors = {};
    const license = driverForm.licenseNumber.trim().toUpperCase();
    if (!license) {
      next.licenseNumber = "La licencia es requerida";
    } else if (!/^[A-Z0-9]{10}$/.test(license)) {
      next.licenseNumber = "Debe tener 10 caracteres alfanuméricos";
    }
    if (selectedRoleCode === ROLE_CODES.CHOFER) {
      if (!driverForm.postalCode.trim()) {
        next.postalCode = "El código postal es requerido";
      } else if (driverForm.postalCode.trim().length !== 5) {
        next.postalCode = "Ingresa un código postal válido";
      }
      if (
        !driverForm.neighborhoodFullCode ||
        driverForm.neighborhoodFullCode === "-1"
      ) {
        next.neighborhoodFullCode = "Selecciona una colonia";
      }
      if (!driverForm.street.trim()) {
        next.street = "La calle es requerida";
      }
      if (!driverForm.externalNumber.trim()) {
        next.externalNumber = "El número exterior es requerido";
      }
    }
    setDriverErrors(next);
    return Object.keys(next).length === 0;
  };
  const validateForm = (): boolean => {
    const next: UserFormErrors = {};
    const trimmedFirstName = user.firstName.trim();
    if (!trimmedFirstName) {
      next.firstName = "El nombre es requerido";
    } else if (trimmedFirstName.length > NAME_MAX_LENGTH) {
      next.firstName = `Máximo ${NAME_MAX_LENGTH} caracteres`;
    } else if (!isValidPersonName(trimmedFirstName)) {
      next.firstName = "Solo letras y un espacio entre palabras";
    }
    const trimmedLastName = user.lastName.trim();
    if (!trimmedLastName) {
      next.lastName = "El apellido es requerido";
    } else if (trimmedLastName.length > NAME_MAX_LENGTH) {
      next.lastName = `Máximo ${NAME_MAX_LENGTH} caracteres`;
    } else if (!isValidPersonName(trimmedLastName)) {
      next.lastName = "Solo letras y un espacio entre palabras";
    }
    if (!user.username.trim()) {
      next.username = "El número de empleado es requerido";
    } else if (user.username.trim().length > USERNAME_MAX_LENGTH) {
      next.username = `Máximo ${USERNAME_MAX_LENGTH} caracteres`;
    } else if (usernameChanged && usernameExists) {
      next.username = "Este número de empleado ya existe";
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
    setErrors(next);
    const driverValid = validateDriverForm();
    return (
      Object.keys(next).length === 0 &&
      driverValid &&
      !(usernameChanged && usernameExists)
    );
  };
  const handleConfirm = async () => {
    if (!validateForm()) return;
    const driverDetails = buildDriverDetailsPayload();
    setSendingInvite(true);
    const result = isNew
      ? await createUser({
          firstName: user.firstName.trim(),
          lastName: user.lastName.trim(),
          username: user.username.trim().slice(0, USERNAME_MAX_LENGTH),
          cellphone: user.cellphone.trim(),
          roleId: user.roleId as number,
          branchIds: user.branchIds,
          requiresOtp: user.requiresOtp,
          driverDetails,
        })
      : await updateUser(userId!, {
          firstName: user.firstName.trim(),
          lastName: user.lastName.trim(),
          username: user.username.trim().slice(0, USERNAME_MAX_LENGTH),
          cellphone: user.cellphone.trim(),
          roleId: user.roleId as number,
          branchIds: user.branchIds,
          requiresOtp: user.requiresOtp,
          driverDetails,
        });
    if (result.error) {
      showError(result.error.message);
      setSendingInvite(false);
      return;
    }
    showSuccess(
      result.data?.message ??
        (isNew
          ? "Se ha enviado una invitación al usuario."
          : "Usuario actualizado correctamente."),
    );
    router.push("/catalogos/usuarios");
    setSendingInvite(false);
  };
  const handleBranchChange = (selectedIds: (string | number)[]) => {
    setUserField("branchIds", selectedIds as number[]);
  };
  const handleRoleChange = (value: number | "") => {
    setUserField("roleId", value);
    if (isNew) {
      const role = roles.find((r) => r.id === value);
      setUserField("requiresOtp", isHighPrivilegeRoleCode(role?.code));
    }
  };
  const branchItems: SelectableItem[] = branches.map((branch) => ({
    id: branch.id,
    label: branch.name,
  }));
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: "Usuarios",
      href: "/catalogos/usuarios",
    },
    {
      label: isNew ? "Nuevo" : "Editar",
    },
  ];
  const inviteInfoMessage = (() => {
    if (!isNew) return null;
    switch (selectedRole?.platform) {
      case "APP":
        return "Se generará una contraseña temporal y se enviará por WhatsApp para acceder a la aplicación móvil.";
      case "INTERNAL":
        return "Este rol es de uso interno; el usuario no tendrá acceso al portal ni a la aplicación.";
      default:
        return "Se generará una contraseña temporal y se enviará por WhatsApp al crear el usuario.";
    }
  })();
  const usernameHelperText =
    errors.username ||
    (usernameChanged && usernameExists
      ? "Este número de empleado ya existe"
      : undefined);
  if (loading) {
    return (
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
    );
  }
  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbItems} />
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5">
          {isNew ? "Nuevo usuario" : "Editar usuario"}
        </Typography>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={sendingInvite || !canSaveUser}
        >
          {sendingInvite ? (
            <CircularProgress size={20} color="inherit" />
          ) : isNew ? (
            "Enviar invitación"
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </Stack>
      <Divider />
      <FormCard>
        <Typography variant="subtitle2" fontWeight={600}>
          Datos generales
        </Typography>
        {inviteInfoMessage && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
            }}
          >
            {inviteInfoMessage}
          </Typography>
        )}
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <FormTextField
              label="Nombre(s)"
              placeholder="Ej. Juan"
              value={user.firstName}
              onChange={(e) =>
                setUserField(
                  "firstName",
                  personNameFilter(e.target.value).slice(0, NAME_MAX_LENGTH),
                )
              }
              error={Boolean(errors.firstName)}
              helperText={errors.firstName || undefined}
              inputProps={{
                maxLength: NAME_MAX_LENGTH,
              }}
              autoFocus
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <FormTextField
              label="Apellido(s)"
              placeholder="Ej. Pérez García"
              value={user.lastName}
              onChange={(e) =>
                setUserField(
                  "lastName",
                  personNameFilter(e.target.value).slice(0, NAME_MAX_LENGTH),
                )
              }
              error={Boolean(errors.lastName)}
              helperText={errors.lastName || undefined}
              inputProps={{
                maxLength: NAME_MAX_LENGTH,
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <FormTextField
              label="Número de empleado"
              placeholder={`Máx. ${USERNAME_MAX_LENGTH} caracteres`}
              value={user.username}
              onChange={(e) =>
                setUserField(
                  "username",
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, USERNAME_MAX_LENGTH),
                )
              }
              error={
                Boolean(errors.username) || (usernameChanged && usernameExists)
              }
              helperText={usernameHelperText}
              InputProps={{
                endAdornment:
                  usernameChanged && isCheckingUsername ? (
                    <InputAdornment position="end">
                      <CircularProgress size={18} />
                    </InputAdornment>
                  ) : undefined,
              }}
              inputProps={{
                maxLength: USERNAME_MAX_LENGTH,
                inputMode: "numeric",
              }}
            />
          </Grid>
        </Grid>
        <Divider />
        <Typography variant="subtitle2" fontWeight={600}>
          Rol y contacto
        </Typography>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <FormTextField
              label="Celular"
              placeholder="Ej. 8341234567"
              required
              value={user.cellphone}
              onChange={(e) =>
                setUserField(
                  "cellphone",
                  e.target.value.replace(/\D/g, "").slice(0, 15),
                )
              }
              error={Boolean(errors.cellphone)}
              helperText={errors.cellphone || undefined}
              inputProps={{
                inputMode: "tel",
                maxLength: 10,
              }}
            />
          </Grid>
          <Grid
            size={{
              xs: 12,
              md: 6,
            }}
          >
            <FormSelect
              label="Selecciona un rol"
              placeholder="Selecciona un rol"
              value={user.roleId}
              onChange={(e) =>
                handleRoleChange(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              error={Boolean(errors.roleId)}
              helperText={errors.roleId || undefined}
            />
            <HelperTextLink>
              Si deseas crear un rol nuevo, ve hacia el módulo{" "}
              <Link href="/catalogos/roles">Roles</Link>
            </HelperTextLink>
          </Grid>
        </Grid>
        {canSaveUser && (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.requiresOtp}
                  onChange={(e) =>
                    setUserField("requiresOtp", e.target.checked)
                  }
                  disabled={sendingInvite}
                />
              }
              label="Requiere doble factor (OTP) para iniciar sesión"
            />
            {isNew && (
              <Typography variant="caption" color="text.secondary" display="block">
                Sugerido según el rol seleccionado; puedes cambiarlo antes de guardar.
              </Typography>
            )}
          </Box>
        )}
        {isDriverRoleCode(selectedRoleCode) && (
          <>
            <Divider />
            <UserDriverFields
              roleCode={selectedRoleCode}
              values={driverForm}
              errors={driverErrors}
              onFieldChange={setDriverField}
              onMergePatch={mergeDriverPatch}
              disabled={sendingInvite}
            />
          </>
        )}
        <Divider />
        <Typography variant="subtitle2" fontWeight={600}>
          Sucursal asignada
        </Typography>
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
  );
}
