import { useMemo } from "react";
import {
  FormHelperText,
  Grid,
  Stack,
  Switch,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useQuery } from "@tanstack/react-query";
import {
  FormAutocomplete,
  FormDatePicker,
  FormSelect,
  FormTextField,
  RadioButton,
  RadioButtonGroup,
} from "@/components";
import type { SelectOption } from "@/components/Form";
import { ROLE_CODES } from "@/constants/role-codes";
import { useBranchesSelect } from "@/hooks/branches/useBranchesSelect";
import { useRepairSuppliersSelect } from "@/hooks/repair-suppliers/useRepairSuppliersSelect";
import { useUsersSelect } from "@/hooks/users/useUsersSelect";
import { getDamagedProductsCatalog } from "@/services/damaged-products.service";
import type { ServiceOrderIndicaciones } from "@/types/atencion-cliente.types";
import { indicacionesPatchForAction } from "@/types/atencion-cliente.types";
import {
  AlertBox,
  CostSection,
  RadioGroupResponsive,
  SectionLabel,
  SwitchRow,
} from "@/styles/atencion-cliente.styles";

export interface ServiceOrderIndicacionesTabProps {
  indicaciones: ServiceOrderIndicaciones;
  customerAddress: string;
  disabled?: boolean;
  /** Gerente o administrador. Quien no lo sea no puede elegir cancelar. */
  canRequestCancellation?: boolean;
  cancelErrors?: {
    damage: string;
    intake: string;
    address: string;
  };
  onChange: (patch: Partial<ServiceOrderIndicaciones>) => void;
}

function catalogItemIdString(item: { id: string | number }): string {
  return String(item.id);
}

const DRIVER_ROLE_CODES_EXCLUDED = `${ROLE_CODES.CHOFER},${ROLE_CODES.AYUDANTE_CHOFER}`;

export function ServiceOrderIndicacionesTab({
  indicaciones,
  customerAddress,
  disabled = false,
  canRequestCancellation = false,
  cancelErrors,
  onChange,
}: ServiceOrderIndicacionesTabProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const action = indicaciones.action;

  const repairSuppliersQuery = useRepairSuppliersSelect();
  const branchesQuery = useBranchesSelect();

  const catalogQuery = useQuery({
    queryKey: ["damaged-products-catalog", "service-order"],
    queryFn: async () => {
      const result = await getDamagedProductsCatalog();
      if (result.error != null) throw new Error(result.error.message);
      if (result.data == null) throw new Error("Catálogo vacío");
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const employeesQuery = useUsersSelect({
    excludeRoleCodes: DRIVER_ROLE_CODES_EXCLUDED,
  });

  // "Autorizó" uses the same employee list (repairResponsibles catalog is often empty).
  const authorizersQuery = employeesQuery;

  const repairSupplierOptions = repairSuppliersQuery.selectOptions;
  const authorizerOptions = authorizersQuery.selectOptions;
  const branchOptions = branchesQuery.selectOptions;

  const damageTypeOptions: SelectOption[] = useMemo(
    () =>
      (catalogQuery.data?.damageTypes ?? []).map((item) => ({
        value: catalogItemIdString(item),
        label: item.label,
      })),
    [catalogQuery.data?.damageTypes],
  );

  const technicianOptions: SelectOption[] = useMemo(
    () =>
      (catalogQuery.data?.repairResponsibles ?? []).map((item) => ({
        value: catalogItemIdString(item),
        label: item.label,
      })),
    [catalogQuery.data?.repairResponsibles],
  );

  const addressOptions: SelectOption[] = useMemo(() => {
    const options: SelectOption[] = [
      { value: customerAddress, label: customerAddress },
    ];
    if (indicaciones.address && indicaciones.address !== customerAddress) {
      options.push({
        value: indicaciones.address,
        label: indicaciones.address,
      });
    }
    return options;
  }, [customerAddress, indicaciones.address]);

  const showRepairAddressField = useMemo(() => {
    if (indicaciones.repairPlace === "domicilio") return true;
    if (indicaciones.repairPlace !== "bodega") return false;
    if (indicaciones.repairBy !== "interna") return true;
    return indicaciones.warehouseIntake === "logistica_foly";
  }, [
    indicaciones.repairBy,
    indicaciones.repairPlace,
    indicaciones.warehouseIntake,
  ]);

  const handleActionChange = (nextAction: ServiceOrderIndicaciones["action"]) => {
    onChange(indicacionesPatchForAction(nextAction, indicaciones));
  };

  return (
    <Stack spacing={2}>
      <Stack spacing={1}>
        <SectionLabel>¿Qué se hará con el artículo?</SectionLabel>
        <RadioGroupResponsive>
          <RadioButton
            value="reparacion"
            label="Reparación"
            checked={action === "reparacion"}
            onChange={() => handleActionChange("reparacion")}
            disabled={disabled}
            fullWidth={isMobile}
          />
          <RadioButton
            value="reemplazar"
            label="Reemplazar artículo"
            checked={action === "reemplazar"}
            onChange={() => handleActionChange("reemplazar")}
            disabled={disabled}
            fullWidth={isMobile}
          />
          {(canRequestCancellation || action === "cancelar_venta") && (
            <RadioButton
              value="cancelar_venta"
              label="Cancelar venta"
              checked={action === "cancelar_venta"}
              onChange={() => handleActionChange("cancelar_venta")}
              disabled={disabled || !canRequestCancellation}
              fullWidth={isMobile}
            />
          )}
        </RadioGroupResponsive>
      </Stack>

      {action === "reparacion" && (
        <>
          <Stack spacing={1}>
            <SectionLabel>¿Quién realizará la reparación?</SectionLabel>
            <RadioGroupResponsive>
              <RadioButton
                value="interna"
                label="Reparación interna"
                checked={indicaciones.repairBy === "interna"}
                onChange={() =>
                  onChange({ repairBy: "interna", repairSupplierId: null })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
              <RadioButton
                value="terceros"
                label="Reparar con terceros"
                checked={indicaciones.repairBy === "terceros"}
                onChange={() =>
                  onChange({
                    repairBy: "terceros",
                    repairTechnicianId: null,
                  })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
            </RadioGroupResponsive>
          </Stack>

          {indicaciones.repairBy === "interna" && (
            <FormAutocomplete
              label="Técnico u operador responsable"
              options={technicianOptions}
              value={
                indicaciones.repairTechnicianId != null
                  ? String(indicaciones.repairTechnicianId)
                  : ""
              }
              onChange={(value) => {
                onChange({
                  repairTechnicianId: value ? Number(value) : null,
                });
              }}
              disabled={disabled || catalogQuery.isPending}
              placeholder="Buscar técnico"
              noOptionsText={
                catalogQuery.isError
                  ? "No se pudieron cargar técnicos"
                  : "Sin técnicos responsables de reparación"
              }
            />
          )}

          {indicaciones.repairBy === "terceros" && (
            <FormAutocomplete
              label="Selecciona un proveedor de reparaciones"
              options={repairSupplierOptions}
              value={
                indicaciones.repairSupplierId != null
                  ? String(indicaciones.repairSupplierId)
                  : ""
              }
              onChange={(value) => {
                onChange({
                  repairSupplierId: value ? Number(value) : null,
                });
              }}
              disabled={disabled || repairSuppliersQuery.isPending}
              placeholder="Buscar proveedor"
              noOptionsText={
                repairSuppliersQuery.isError
                  ? "No se pudieron cargar proveedores"
                  : "Sin proveedores"
              }
            />
          )}

          <CostSection>
            <SwitchRow>
              <Typography variant="body2" fontWeight={500}>
                ¿Agregar costo?
              </Typography>
              <Switch
                checked={indicaciones.addCost}
                onChange={(_, checked) => onChange({ addCost: checked })}
                disabled={disabled}
                color="primary"
              />
            </SwitchRow>

            {
              indicaciones.addCost && (
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <FormTextField
                      label="Horas"
                      type="number"
                      value={String(indicaciones.hours)}
                      onChange={(event) =>
                        onChange({
                          hours: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                      disabled={disabled}
                      inputProps={{ min: 0, step: 1 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <FormTextField
                      label="Costo"
                      type="number"
                      value={String(indicaciones.cost)}
                      onChange={(event) =>
                        onChange({
                          cost: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                      disabled={disabled}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">Asignar costo a</Typography>
                      <RadioButtonGroup>
                        <RadioButton
                          value="proveedor"
                          label="Proveedor"
                          checked={indicaciones.costAssignedTo === "proveedor"}
                          onChange={() =>
                            onChange({ costAssignedTo: "proveedor" })
                          }
                          disabled={disabled}
                          size="small"
                        />
                        <RadioButton
                          value="foly"
                          label="Foly"
                          checked={indicaciones.costAssignedTo === "foly"}
                          onChange={() => onChange({ costAssignedTo: "foly" })}
                          disabled={disabled}
                          size="small"
                        />
                      </RadioButtonGroup>
                    </Stack>
                  </Grid>
                </Grid>
              )}
          </CostSection>

          <Stack spacing={1}>
            <SectionLabel>Lugar de reparación</SectionLabel>
            <RadioGroupResponsive>
              <RadioButton
                value="bodega"
                label="Bodega Foly"
                checked={indicaciones.repairPlace === "bodega"}
                onChange={() => onChange({ repairPlace: "bodega" })}
                disabled={disabled}
                fullWidth={isMobile}
              />
              <RadioButton
                value="domicilio"
                label="Domicilio del cliente"
                checked={indicaciones.repairPlace === "domicilio"}
                onChange={() =>
                  onChange({
                    repairPlace: "domicilio",
                    warehouseIntake: "",
                    address: indicaciones.address || customerAddress,
                  })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
            </RadioGroupResponsive>
          </Stack>

          {
            indicaciones.repairBy === "interna" &&
            indicaciones.repairPlace === "bodega" && (
              <Stack spacing={1}>
                <SectionLabel>
                  ¿Cómo ingresará el artículo a la bodega?
                </SectionLabel>
                <Stack spacing={1}>
                  <RadioButton
                    value="cliente_entrega"
                    label="El cliente lo llevará por su cuenta"
                    checked={indicaciones.warehouseIntake === "cliente_entrega"}
                    onChange={() =>
                      onChange({
                        warehouseIntake: "cliente_entrega",
                        address: "",
                      })
                    }
                    disabled={disabled}
                    block
                  />
                  <RadioButton
                    value="logistica_foly"
                    label="Logística Foly realizará la recolección"
                    checked={indicaciones.warehouseIntake === "logistica_foly"}
                    onChange={() =>
                      onChange({
                        warehouseIntake: "logistica_foly",
                        address: indicaciones.address || customerAddress,
                      })
                    }
                    disabled={disabled}
                    block
                  />
                </Stack>
              </Stack>
            )
          }

          {showRepairAddressField && (
            <FormSelect
              label={
                indicaciones.repairPlace === "bodega" &&
                  indicaciones.warehouseIntake === "logistica_foly"
                  ? "Domicilio de recolección"
                  : "Domicilio en donde se realizará la reparación"
              }
              options={addressOptions}
              value={indicaciones.address || customerAddress}
              onChange={(event) =>
                onChange({ address: String(event.target.value) })
              }
              disabled={disabled}
            />
          )}

          <FormDatePicker
            label="Fecha a realizar"
            value={indicaciones.scheduledDate}
            onChange={(value) => onChange({ scheduledDate: value })}
            disabled={disabled}
            placeholder="Selecciona una fecha"
          />

          <FormTextField
            label="Tipo de daño"
            value={indicaciones.damageDescription}
            onChange={(event) =>
              onChange({ damageDescription: event.target.value })
            }
            disabled={disabled}
            placeholder="Describe el desperfecto del artículo"
          />

          <FormAutocomplete
            label="Autorizó"
            options={authorizerOptions}
            value={indicaciones.authorizedById}
            onChange={(value) => onChange({ authorizedById: value })}
            disabled={disabled || authorizersQuery.isPending}
            placeholder="Buscar usuario"
            noOptionsText={
              authorizersQuery.isError
                ? "No se pudieron cargar usuarios"
                : "Sin usuarios"
            }
          />

          <FormTextField
            label="Observaciones"
            value={indicaciones.observations}
            onChange={(event) => onChange({ observations: event.target.value })}
            disabled={disabled}
            multiline
            minRows={3}
            placeholder="Ingrese"
          />
        </>
      )}

      {action === "reemplazar" && (
        <>
          <Stack spacing={1}>
            <SectionLabel>¿Quién realizará el reemplazo?</SectionLabel>
            <RadioGroupResponsive>
              <RadioButton
                value="proveedor"
                label="Proveedor"
                checked={indicaciones.replacementBy === "proveedor"}
                onChange={() =>
                  onChange({ replacementBy: "proveedor", branchId: null })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
              <RadioButton
                value="foly"
                label="Foly"
                checked={indicaciones.replacementBy === "foly"}
                onChange={() => onChange({ replacementBy: "foly" })}
                disabled={disabled}
                fullWidth={isMobile}
              />
            </RadioGroupResponsive>
          </Stack>

          <FormSelect
            label="Domicilio en donde se recolectará el artículo"
            options={addressOptions}
            value={indicaciones.address || customerAddress}
            onChange={(event) =>
              onChange({ address: String(event.target.value) })
            }
            disabled={disabled}
          />

          {indicaciones.replacementBy === "foly" && (
            <FormAutocomplete
              label="Sucursal donde se recuperará el artículo"
              options={branchOptions}
              value={
                indicaciones.branchId != null
                  ? String(indicaciones.branchId)
                  : ""
              }
              onChange={(value) => {
                onChange({ branchId: value ? Number(value) : null });
              }}
              disabled={disabled || branchesQuery.isPending}
              placeholder="Buscar sucursal"
              noOptionsText={
                branchesQuery.isError
                  ? "No se pudieron cargar sucursales"
                  : "Sin sucursales"
              }
            />
          )}

          <FormDatePicker
            label="Fecha a realizar"
            value={indicaciones.scheduledDate}
            onChange={(value) => onChange({ scheduledDate: value })}
            disabled={disabled}
            placeholder="Selecciona una fecha"
          />

          <FormSelect
            label="Tipo de daño"
            options={damageTypeOptions}
            value={indicaciones.damageTypeId}
            onChange={(event) =>
              onChange({ damageTypeId: String(event.target.value) })
            }
            disabled={disabled || catalogQuery.isPending}
            placeholder="Selecciona"
          />

          <FormAutocomplete
            label="Autorizó"
            options={authorizerOptions}
            value={indicaciones.authorizedById}
            onChange={(value) => onChange({ authorizedById: value })}
            disabled={disabled || authorizersQuery.isPending}
            placeholder="Buscar usuario"
            noOptionsText={
              authorizersQuery.isError
                ? "No se pudieron cargar usuarios"
                : "Sin usuarios"
            }
          />

          <FormTextField
            label="Observaciones"
            value={indicaciones.observations}
            onChange={(event) => onChange({ observations: event.target.value })}
            disabled={disabled}
            multiline
            minRows={3}
            placeholder="Ingrese"
          />
        </>
      )}

      {action === "cancelar_venta" && (
        <>
          <AlertBox tone="warning">
            Solicitar la cancelación crea la hoja de recuperación. El saldo a
            favor se abona cuando almacén confirma que recibió el artículo.
          </AlertBox>
          {indicaciones.recoveryReceiver && !indicaciones.warehouseIntake ? (
            <AlertBox tone="info">
              Registro anterior de recolección. Queda solo como consulta y no
              vuelve a abonar saldo.
            </AlertBox>
          ) : null}

          <FormTextField
            label="Tipo de daño"
            value={indicaciones.damageDescription}
            onChange={(event) =>
              onChange({ damageDescription: event.target.value })
            }
            disabled={disabled || !canRequestCancellation}
            placeholder="Describe el desperfecto del artículo"
            error={Boolean(cancelErrors?.damage)}
            helperText={cancelErrors?.damage || undefined}
          />

          <Stack spacing={1}>
            <SectionLabel>¿Cómo regresa el artículo?</SectionLabel>
            <Stack spacing={1}>
              <RadioButton
                value="cliente_entrega"
                label="El cliente lo entregará por sus medios"
                checked={indicaciones.warehouseIntake === "cliente_entrega"}
                onChange={() =>
                  onChange({ warehouseIntake: "cliente_entrega", address: "" })
                }
                disabled={disabled || !canRequestCancellation}
                error={Boolean(cancelErrors?.intake)}
                block
              />
              <RadioButton
                value="logistica_foly"
                label="Logística Foly realizará la recolección"
                checked={indicaciones.warehouseIntake === "logistica_foly"}
                onChange={() =>
                  onChange({
                    warehouseIntake: "logistica_foly",
                    address: indicaciones.address || customerAddress,
                  })
                }
                disabled={disabled || !canRequestCancellation}
                error={Boolean(cancelErrors?.intake)}
                block
              />
            </Stack>
            {cancelErrors?.intake ? (
              <FormHelperText error sx={{ mx: 0 }}>
                {cancelErrors.intake}
              </FormHelperText>
            ) : null}
          </Stack>

          {indicaciones.warehouseIntake === "logistica_foly" && (
            <FormTextField
              label="Domicilio de recolección"
              value={indicaciones.address}
              onChange={(event) => onChange({ address: event.target.value })}
              disabled={disabled || !canRequestCancellation}
              placeholder="Calle, número y colonia"
              error={Boolean(cancelErrors?.address)}
              helperText={cancelErrors?.address || undefined}
            />
          )}

          <FormTextField
            label="Observaciones"
            value={indicaciones.observations}
            onChange={(event) => onChange({ observations: event.target.value })}
            disabled={disabled || !canRequestCancellation}
            multiline
            minRows={3}
            placeholder="Ingrese"
          />
        </>
      )}
    </Stack>
  );
}

const ServiceOrderIndicacionesTabPage = () => null;

export default ServiceOrderIndicacionesTabPage;
