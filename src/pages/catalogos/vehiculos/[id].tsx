import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { Breadcrumbs, FormTextField, FormSelect } from "@/components";
import type { BreadcrumbItem } from "@/components/Breadcrumbs";
import { SatCatalogSearchField } from "@/components/SatCatalogSearchField";
import { FormCard } from "@/styles/catalogos/vehiculos.styles";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { usePermissions } from "@/hooks/usePermissions";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { CATALOG_VEHICLES_CREATE, CATALOG_VEHICLES_UPDATE } from "@/lib/permissions";
import { filters } from "@/forms/validation/filters";
import {
  createVehicle,
  getVehicleById,
  updateVehicle,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  type VehicleStatus,
  type VehicleType,
} from "@/services/vehicles.service";

const plateFilter = filters.satPlate();
const weightFilter = filters.decimal(3, 6);
const currentYear = new Date().getFullYear();
const MAX_MODEL_YEAR = currentYear + 1;
const MIN_MODEL_YEAR = 1994;

type VehicleFormState = {
  plate: string;
  vehicleConfigKey: string;
  year: string;
  grossVehicleWeight: string;
  brand: string;
  model: string;
  type: VehicleType;
  color: string;
  vin: string;
  status: VehicleStatus;
  sctPermitTypeKey: string;
  sctPermitNumber: string;
  civilLiabilityInsurer: string;
  civilLiabilityPolicy: string;
};

type VehicleFormErrors = Partial<Record<keyof VehicleFormState, string>>;

const initialForm: VehicleFormState = {
  plate: "",
  vehicleConfigKey: "",
  year: "",
  grossVehicleWeight: "",
  brand: "",
  model: "",
  type: "VAN",
  color: "",
  vin: "",
  status: "ACTIVE",
  sctPermitTypeKey: "",
  sctPermitNumber: "",
  civilLiabilityInsurer: "",
  civilLiabilityPolicy: "",
};

function validateForm(form: VehicleFormState): VehicleFormErrors {
  const errors: VehicleFormErrors = {};
  if (!/^[A-Z0-9Ñ]{5,7}$/.test(form.plate)) {
    errors.plate = "La placa debe tener 5 a 7 caracteres, sin guiones ni espacios.";
  }
  if (!form.vehicleConfigKey) {
    errors.vehicleConfigKey = "La configuración vehicular es requerida.";
  }
  const year = Number(form.year);
  if (!form.year || Number.isNaN(year) || !Number.isInteger(year)) {
    errors.year = "El año del modelo es requerido.";
  } else if (year < MIN_MODEL_YEAR || year > MAX_MODEL_YEAR) {
    errors.year = `El año debe estar entre ${MIN_MODEL_YEAR} y ${MAX_MODEL_YEAR}.`;
  }
  const weight = Number(form.grossVehicleWeight);
  if (!form.grossVehicleWeight || Number.isNaN(weight) || weight <= 0) {
    errors.grossVehicleWeight = "El peso bruto vehicular es requerido y debe ser mayor a 0.";
  }
  if (!form.brand.trim()) {
    errors.brand = "La marca es requerida.";
  }
  if (!form.model.trim()) {
    errors.model = "El modelo es requerido.";
  }
  if (!form.sctPermitTypeKey) {
    errors.sctPermitTypeKey = "El tipo de permiso SCT es requerido.";
  }
  if (!form.sctPermitNumber.trim()) {
    errors.sctPermitNumber = "El número de permiso SCT es requerido.";
  }
  if (!form.civilLiabilityInsurer.trim()) {
    errors.civilLiabilityInsurer = "La aseguradora es requerida.";
  }
  if (!form.civilLiabilityPolicy.trim()) {
    errors.civilLiabilityPolicy = "La póliza es requerida.";
  }
  return errors;
}

export default function VehicleFormPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { showSuccess, showError } = useSnackbarStore();
  const { id } = router.query;
  const isNew = id === "nuevo";
  const canSave = hasPermission(isNew ? CATALOG_VEHICLES_CREATE : CATALOG_VEHICLES_UPDATE);
  const vehicleId = isNew ? null : Number(id);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<VehicleFormState>(initialForm);
  const [errors, setErrors] = useState<VehicleFormErrors>({});

  const setField = useCallback(<K extends keyof VehicleFormState>(
    key: K,
    value: VehicleFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }, []);

  useAsyncEffect(
    async (isCancelled) => {
      if (isNew) {
        setLoading(false);
        return;
      }
      if (!vehicleId || Number.isNaN(vehicleId)) return;
      setLoading(true);
      const result = await getVehicleById(vehicleId);
      if (isCancelled()) return;
      if (result.error || !result.data) {
        showError(result.error?.message ?? "No se encontró el vehículo.");
        setLoading(false);
        return;
      }
      const vehicle = result.data;
      setForm({
        plate: vehicle.plate,
        vehicleConfigKey: vehicle.vehicleConfigKey ?? "",
        year: String(vehicle.year),
        grossVehicleWeight:
          vehicle.grossVehicleWeight != null ? String(vehicle.grossVehicleWeight) : "",
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        color: vehicle.color ?? "",
        vin: vehicle.vin ?? "",
        status: vehicle.status,
        sctPermitTypeKey: vehicle.sctPermitTypeKey ?? "",
        sctPermitNumber: vehicle.sctPermitNumber ?? "",
        civilLiabilityInsurer: vehicle.civilLiabilityInsurer ?? "",
        civilLiabilityPolicy: vehicle.civilLiabilityPolicy ?? "",
      });
      setLoading(false);
    },
    [isNew, vehicleId],
  );

  const handleSave = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const payload = {
      plate: form.plate,
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      type: form.type,
      color: form.color.trim() || undefined,
      vin: form.vin.trim() || undefined,
      status: form.status,
      vehicleConfigKey: form.vehicleConfigKey,
      grossVehicleWeight: Number(form.grossVehicleWeight),
      sctPermitTypeKey: form.sctPermitTypeKey,
      sctPermitNumber: form.sctPermitNumber.trim(),
      civilLiabilityInsurer: form.civilLiabilityInsurer.trim(),
      civilLiabilityPolicy: form.civilLiabilityPolicy.trim(),
    };

    const result = isNew
      ? await createVehicle(payload)
      : await updateVehicle(vehicleId!, payload);

    setSaving(false);
    if (result.error) {
      showError(result.error.message);
      return;
    }
    showSuccess(isNew ? "Vehículo creado correctamente." : "Vehículo actualizado correctamente.");
    void router.push("/catalogos/vehiculos");
  };

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Vehículos", href: "/catalogos/vehiculos" },
    { label: isNew ? "Nuevo" : form.plate || "Editar" },
  ];

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={240}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Breadcrumbs items={breadcrumbItems} />
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Typography variant="h5">
          {isNew ? "Nuevo vehículo" : "Editar vehículo"}
        </Typography>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !canSave}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : isNew ? "Crear" : "Guardar cambios"}
        </Button>
      </Stack>
      <Divider />

      <FormCard>
        <Typography variant="subtitle2" fontWeight={600}>
          Identificación vehicular (SAT)
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SatCatalogSearchField
              type="vehicle-config"
              label="Configuración vehicular"
              placeholder="Buscar clave SAT (ej. C2, T3S2)"
              value={form.vehicleConfigKey}
              onChange={(value) => setField("vehicleConfigKey", value)}
              required
              error={Boolean(errors.vehicleConfigKey)}
              helperText={errors.vehicleConfigKey}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Placa"
              placeholder="ABC123A"
              value={form.plate}
              onChange={(e) => setField("plate", plateFilter(e.target.value))}
              error={Boolean(errors.plate)}
              helperText={errors.plate || "Sin guiones ni espacios, 5 a 7 caracteres"}
              required
              inputProps={{ maxLength: 7 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Año del modelo"
              placeholder={String(currentYear)}
              value={form.year}
              onChange={(e) => setField("year", filters.onlyNumbers(4)(e.target.value))}
              error={Boolean(errors.year)}
              helperText={errors.year}
              required
              inputProps={{ inputMode: "numeric", maxLength: 4 }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Peso bruto vehicular"
              placeholder="8.500"
              value={form.grossVehicleWeight}
              onChange={(e) => setField("grossVehicleWeight", weightFilter(e.target.value))}
              error={Boolean(errors.grossVehicleWeight)}
              helperText={errors.grossVehicleWeight || "Toneladas (t)"}
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">t</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>
      </FormCard>

      <FormCard>
        <Typography variant="subtitle2" fontWeight={600}>
          Datos de flota
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Marca"
              placeholder="Nissan"
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value.slice(0, 64))}
              error={Boolean(errors.brand)}
              helperText={errors.brand}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Modelo"
              placeholder="NP300"
              value={form.model}
              onChange={(e) => setField("model", e.target.value.slice(0, 64))}
              error={Boolean(errors.model)}
              helperText={errors.model}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              label="Tipo"
              value={form.type}
              onChange={(e) => setField("type", e.target.value as VehicleType)}
              options={VEHICLE_TYPES.map((value) => ({
                value,
                label: VEHICLE_TYPE_LABELS[value],
              }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Color"
              placeholder="Blanco"
              value={form.color}
              onChange={(e) => setField("color", e.target.value.slice(0, 32))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="VIN"
              placeholder="1HGCM82633A123456"
              value={form.vin}
              onChange={(e) =>
                setField("vin", e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 32))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormSelect
              label="Estatus"
              value={form.status}
              onChange={(e) => setField("status", e.target.value as VehicleStatus)}
              options={VEHICLE_STATUSES.map((value) => ({
                value,
                label: VEHICLE_STATUS_LABELS[value],
              }))}
            />
          </Grid>
        </Grid>
      </FormCard>

      <FormCard>
        <Typography variant="subtitle2" fontWeight={600}>
          Permisos SCT
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <SatCatalogSearchField
              type="permit-type"
              label="Tipo de permiso"
              placeholder="Buscar permiso SAT (ej. TPAF01)"
              value={form.sctPermitTypeKey}
              onChange={(value) => setField("sctPermitTypeKey", value)}
              required
              error={Boolean(errors.sctPermitTypeKey)}
              helperText={errors.sctPermitTypeKey}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Número de permiso SCT"
              placeholder="Folio otorgado por la SCT"
              value={form.sctPermitNumber}
              onChange={(e) => setField("sctPermitNumber", e.target.value.slice(0, 50))}
              error={Boolean(errors.sctPermitNumber)}
              helperText={errors.sctPermitNumber}
              required
            />
          </Grid>
        </Grid>
      </FormCard>

      <FormCard>
        <Typography variant="subtitle2" fontWeight={600}>
          Seguros obligatorios
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Aseguradora de responsabilidad civil"
              placeholder="Nombre de la aseguradora"
              value={form.civilLiabilityInsurer}
              onChange={(e) => setField("civilLiabilityInsurer", e.target.value.slice(0, 50))}
              error={Boolean(errors.civilLiabilityInsurer)}
              helperText={errors.civilLiabilityInsurer}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormTextField
              label="Póliza de responsabilidad civil"
              placeholder="Número de póliza vigente"
              value={form.civilLiabilityPolicy}
              onChange={(e) => setField("civilLiabilityPolicy", e.target.value.slice(0, 30))}
              error={Boolean(errors.civilLiabilityPolicy)}
              helperText={errors.civilLiabilityPolicy}
              required
            />
          </Grid>
        </Grid>
      </FormCard>

      <Box display={{ xs: "block", sm: "none" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          disabled={saving || !canSave}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : isNew ? "Crear" : "Guardar cambios"}
        </Button>
      </Box>
    </Stack>
  );
}
