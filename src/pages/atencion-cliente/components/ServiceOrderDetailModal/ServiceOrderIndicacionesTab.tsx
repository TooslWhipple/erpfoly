import { useMemo } from "react";
import {
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

  // Always cached (like repair suppliers) so detail/options are ready immediately.
  const driversQuery = useUsersSelect({
    roleCode: ROLE_CODES.CHOFER,
  });

  const employeesQuery = useUsersSelect({
    excludeRoleCodes: DRIVER_ROLE_CODES_EXCLUDED,
  });

  // "Autorizó" uses the same employee list (repairResponsibles catalog is often empty).
  const authorizersQuery = employeesQuery;

  const repairSupplierOptions = repairSuppliersQuery.selectOptions;
  const driverOptions = driversQuery.selectOptions;
  const employeeOptions = employeesQuery.selectOptions;
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

  const handleActionChange = (nextAction: ServiceOrderIndicaciones["action"]) => {
    onChange(indicacionesPatchForAction(nextAction, indicaciones));
  };

  return (
    <Stack spacing={2.5}>
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
          <RadioButton
            value="cancelar_venta"
            label="Cancelar venta"
            checked={action === "cancelar_venta"}
            onChange={() => handleActionChange("cancelar_venta")}
            disabled={disabled}
            fullWidth={isMobile}
          />
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
                onChange={() => onChange({ repairBy: "terceros" })}
                disabled={disabled}
                fullWidth={isMobile}
              />
            </RadioGroupResponsive>
          </Stack>

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

            {indicaciones.addCost && (
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
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Asignar costo a
                    </Typography>
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
                    address: indicaciones.address || customerAddress,
                  })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
            </RadioGroupResponsive>
          </Stack>

          <FormSelect
            label="Domicilio en donde se realizará la reparación"
            options={addressOptions}
            value={indicaciones.address || customerAddress}
            onChange={(event) =>
              onChange({ address: String(event.target.value) })
            }
            disabled={disabled}
          />

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
            Esta acción primero generará una orden de recuperación antes de su
            cancelación.
          </AlertBox>
          <AlertBox tone="info">
            Al cancelar la venta, el monto total pagado de este artículo pasará
            a saldo a favor del cliente.
          </AlertBox>

          <Typography variant="subtitle2" fontWeight={600}>
            Ingresa los datos para la orden de recuperación del artículo
          </Typography>

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

          <Stack spacing={1}>
            <RadioGroupResponsive>
              <RadioButton
                value="chofer"
                label="Recibe chofer"
                checked={indicaciones.recoveryReceiver === "chofer"}
                onChange={() =>
                  onChange({
                    recoveryReceiver: "chofer",
                    assignedEmployeeId: null,
                  })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
              <RadioButton
                value="empleado"
                label="Recibe empleado"
                checked={indicaciones.recoveryReceiver === "empleado"}
                onChange={() =>
                  onChange({
                    recoveryReceiver: "empleado",
                    assignedDriverId: null,
                  })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
              <RadioButton
                value="no_se_recoge"
                label="No se recoge artículo"
                checked={indicaciones.recoveryReceiver === "no_se_recoge"}
                onChange={() =>
                  onChange({
                    recoveryReceiver: "no_se_recoge",
                    assignedDriverId: null,
                    assignedEmployeeId: null,
                  })
                }
                disabled={disabled}
                fullWidth={isMobile}
              />
            </RadioGroupResponsive>
          </Stack>

          {indicaciones.recoveryReceiver === "chofer" && (
            <FormAutocomplete
              label="Chofer que realizará la recolección"
              options={driverOptions}
              value={
                indicaciones.assignedDriverId != null
                  ? String(indicaciones.assignedDriverId)
                  : ""
              }
              onChange={(value) => {
                onChange({
                  assignedDriverId: value ? Number(value) : null,
                });
              }}
              disabled={disabled || driversQuery.isPending}
              placeholder="Buscar chofer"
              noOptionsText={
                driversQuery.isError
                  ? "No se pudieron cargar choferes"
                  : "Sin choferes"
              }
            />
          )}

          {indicaciones.recoveryReceiver === "empleado" && (
            <FormAutocomplete
              label="Empleado que recibe el artículo"
              options={employeeOptions}
              value={
                indicaciones.assignedEmployeeId != null
                  ? String(indicaciones.assignedEmployeeId)
                  : ""
              }
              onChange={(value) => {
                onChange({
                  assignedEmployeeId: value ? Number(value) : null,
                });
              }}
              disabled={disabled || employeesQuery.isPending}
              placeholder="Buscar empleado"
              noOptionsText={
                employeesQuery.isError
                  ? "No se pudieron cargar empleados"
                  : "Sin empleados"
              }
            />
          )}

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
    </Stack>
  );
}

const ServiceOrderIndicacionesTabPage = () => null;

export default ServiceOrderIndicacionesTabPage;
