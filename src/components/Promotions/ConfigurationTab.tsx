import {
  Alert,
  Box,
  Grid,
  Switch,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { Checkbox, FormTextField, RadioButton } from "@/components";
import { FormCard } from "@/styles/catalogos/productos.styles";
import { SwitchContainer } from "@/styles/catalogos/promociones.styles";
import type { PromotionFormState, FormErrors } from "@/types/promociones.types";
import type { PromotionFormConfiguration } from "@/services/promociones.service";

interface ConfigurationTabProps {
  isModal?: boolean;
  formState: PromotionFormState;
  errors: FormErrors;
  configuration: PromotionFormConfiguration | undefined;
  configurationLoading: boolean;
  configurationError: string | null;
  onFieldChange: (field: keyof PromotionFormState, value: unknown) => void;
  onErrorClear: (field: string) => void;
}

function selectedPurchaseType(
  configuration: PromotionFormConfiguration | undefined,
  purchaseTypeId: number | null
) {
  if (!configuration || purchaseTypeId == null) return undefined;
  return configuration.purchaseTypes.find((p) => p.id === purchaseTypeId);
}

export function ConfigurationTab({
  isModal = false,
  formState,
  errors,
  configuration,
  configurationLoading,
  configurationError,
  onFieldChange,
  onErrorClear,
}: ConfigurationTabProps) {
  const purchaseType = selectedPurchaseType(configuration, formState.purchaseTypeId);

  const toggleTermId = (
    field: "creditTermIds" | "layawayTermIds",
    optionId: number,
    checked: boolean
  ) => {
    const current = formState[field];
    const next = checked
      ? [...current, optionId]
      : current.filter((id) => id !== optionId);
    onFieldChange(field, next);
    if (errors[field]) onErrorClear(field);
  };

  const setCustomerLevelPct = (customerLevelId: number, percentage: number) => {
    const rest = formState.customerLevelDownPayments.filter(
      (x) => x.customer_level_id !== customerLevelId
    );
    onFieldChange("customerLevelDownPayments", [
      ...rest,
      { customer_level_id: customerLevelId, percentage },
    ]);
  };

  const pctForLevel = (customerLevelId: number) =>
    formState.customerLevelDownPayments.find((x) => x.customer_level_id === customerLevelId)
      ?.percentage ?? 0;

  const handleEndDateToggle = (checked: boolean) => {
    onFieldChange("hasEndDate", checked);
    if (!checked) {
      onFieldChange("endDate", null);
      onErrorClear("endDate");
    }
  };

  return (
    <>
      {configurationError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {configurationError}
        </Alert>
      ) : null}
      <FormCard>
        <Stack spacing={0.5}>
          <Typography variant="h6">Configuraciones de la promoción</Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresa un nombre y porcentaje para tu nueva promoción.
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={(isModal) ? { xs: 12 } : { xs: 12, sm: 6 }}>
            <FormTextField
              label="Nombre"
              value={formState.name}
              onChange={(e) => {
                onFieldChange("name", e.target.value);
                if (errors.name) onErrorClear("name");
              }}
              error={Boolean(errors.name)}
              helperText={errors.name}
              placeholder="Ej. Buen fin"
            />
          </Grid>
          <Grid size={(isModal) ? { xs: 6 } : { xs: 12, sm: purchaseType?.code === "APARTADO" ? 3 : 6 }}>
            <FormTextField
              label="Porcentaje"
              value={formState.percentage}
              onChange={(e) => {
                onFieldChange("percentage", e.target.value);
                if (errors.percentage) onErrorClear("percentage");
              }}
              error={Boolean(errors.percentage)}
              helperText={errors.percentage}
              placeholder="15"
              InputProps={{
                endAdornment: <Box component="span" sx={{ color: "text.secondary" }}>%</Box>,
              }}
            />
          </Grid>
          {purchaseType?.code === "APARTADO" ? (
            <Grid size={(isModal) ? { xs: 6 } : { xs: 12, sm: 3 }}>
              <FormTextField
                label="Anticipo"
                value={formState.advancePercentage}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d{0,3}(\.\d*)?$/.test(v)) {
                    onFieldChange("advancePercentage", v);
                    if (errors.advancePercentage) onErrorClear("advancePercentage");
                  }
                }}
                error={Boolean(errors.advancePercentage)}
                helperText={errors.advancePercentage}
                placeholder="0"
                InputProps={{
                  endAdornment: <Box component="span" sx={{ color: "text.secondary" }}>%</Box>,
                }}
              />
            </Grid>
          ) : null}
        </Grid>
      </FormCard>

      <FormCard>
        <Stack spacing={0.5}>
          <Typography variant="h6">Aplicación</Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona a qué tipo de venta se aplicará el Promoción.
          </Typography>
        </Stack>
        <Stack
          direction={(isModal) ? "column" : { xs: "column", md: "row" }}
          spacing={2}
          divider={<Divider orientation="vertical" flexItem />}>

          <Stack spacing={1}>
            <Typography variant="subtitle2">Aplicación</Typography>
            <Grid container spacing={1} flexWrap="wrap">
              {
                configuration?.purchaseTypes.map((item) => (
                  <Grid key={item.id} size={{ xs: 'auto' }}>
                    <RadioButton
                      value={String(item.id)}
                      label={item.label}
                      checked={formState.purchaseTypeId === item.id}
                      onChange={(e) => {
                        const nextId = Number(e.target.value);
                        const nextType = configuration?.purchaseTypes.find((p) => p.id === nextId);
                        onFieldChange("purchaseTypeId", Number.isFinite(nextId) ? nextId : null);
                        onFieldChange("creditTermIds", []);
                        onFieldChange("layawayTermIds", []);
                        if (nextType?.code !== "APARTADO") {
                          onFieldChange("advancePercentage", "");
                          onErrorClear("advancePercentage");
                        }
                        if (errors.purchaseTypeId) onErrorClear("purchaseTypeId");
                      }}
                    />
                  </Grid>
                ))
              }
            </Grid>
          </Stack>
          {
            purchaseType?.code === "CREDITO" && purchaseType.options &&
            <Stack spacing={1}>
              <Typography variant="subtitle2">{purchaseType.optionLabel}</Typography>
              <Grid container spacing={1} flexWrap="wrap">
                {
                  purchaseType.options.map((item) => (
                    <Grid key={item.id} size={{ xs: 'auto' }}>
                      <Checkbox
                        value={String(item.id)}
                        label={`${item.label} meses`}
                        checked={formState.creditTermIds.includes(item.id)}
                        onChange={(e) =>
                          toggleTermId("creditTermIds", item.id, e.target.checked)
                        }
                      />
                    </Grid>
                  ))
                }
              </Grid>
            </Stack>
          }
          {
            purchaseType?.code === "APARTADO" && purchaseType.options && (
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Typography variant="body1" fontWeight={500}>{purchaseType.optionLabel} </Typography>
                <Grid container spacing={1} flexWrap="wrap">
                  {purchaseType.options.map((opt) => (
                    <Grid key={opt.id} size={{ xs: 'auto' }}>
                      <Checkbox
                        value={String(opt.id)}
                        label={`${opt.label} días`}
                        checked={formState.layawayTermIds.includes(opt.id)}
                        onChange={(e) =>
                          toggleTermId("layawayTermIds", opt.id, e.target.checked)
                        }
                      />
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            )
          }
        </Stack>

      </FormCard>

      {(purchaseType?.code === "CREDITO" || purchaseType?.code === "APARTADO") && configuration?.customerLevels?.length &&
        <FormCard>
          <Stack spacing={0.5}>
            <Typography variant="h6">Enganche por nivel de cliente</Typography>
            <Typography variant="body2" color="text.secondary">Configure el porcentaje de anticipo que se aplicará a cada nivel de cliente.</Typography>
          </Stack>
          <Grid container spacing={2} width="100%">
            {
              configuration.customerLevels.map((item) => (
                <Grid size={{ xs: 'auto' }} key={item.id}>
                  <FormTextField
                    label={item.label}
                    value={String(pctForLevel(item.id))}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        const n = value === "" ? 0 : Number(value);
                        setCustomerLevelPct(item.id, Number.isFinite(n) ? n : 0);
                        if (errors.customerLevelDownPayments) {
                          onErrorClear("customerLevelDownPayments");
                        }
                      }
                    }}
                    placeholder="0"
                    InputProps={{
                      endAdornment: <Box component="span" sx={{ color: "text.secondary" }}>%</Box>,
                    }}
                  />
                </Grid>
              ))
            }
          </Grid>
        </FormCard>
      }

      <FormCard>
        <Stack spacing={0.5}>
          <Typography variant="h6">Periodo de vigencia</Typography>
          <Typography variant="body2" color="text.secondary">
            Define el periodo de vigencia para la promoción.
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid size={(isModal) ? { xs: 'grow' } : { xs: 12, sm: 3 }}>
            <FormTextField
              label="Fecha de inicio"
              type="date"
              value={formState.startDate}
              onChange={(e) => {
                onFieldChange("startDate", e.target.value);
                if (errors.startDate) onErrorClear("startDate");
              }}
              error={Boolean(errors.startDate)}
              helperText={errors.startDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: "auto" }}>
            <SwitchContainer style={{ marginTop: '16px' }}>
              <Switch
                checked={formState.hasEndDate}
                onChange={(e) => handleEndDateToggle(e.target.checked)}
              />
            </SwitchContainer>
          </Grid>
          <Grid size={(isModal) ? { xs: 'grow' } : { xs: 12, sm: 3 }}>
            <FormTextField
              label="Fecha de fin"
              type="date"
              value={formState.endDate || ""}
              onChange={(e) => {
                onFieldChange("endDate", e.target.value);
                if (errors.endDate) onErrorClear("endDate");
              }}
              error={Boolean(errors.endDate)}
              helperText={errors.endDate}
              disabled={!formState.hasEndDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      </FormCard>
    </>
  );
}
