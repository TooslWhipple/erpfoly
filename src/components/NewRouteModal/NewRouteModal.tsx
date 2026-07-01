"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { Checkbox, SideModal } from "@/components";
import { FormSelect } from "@/components/Form/FormSelect";
import { FormDatePicker } from "@/components/Form/FormDatePicker";
import { RadioButton, RadioButtonGroup } from "@/components/RadioButton";
import { MultiSelectChips } from "@/components/MultiSelectChips";
import dayjs from "@/lib/dayjs";
import type { CreateRoutePayload } from "@/services/rutas.service";
import type { MunicipalityCatalogItem } from "@/services/municipalities.service";
import type { BranchCatalogItem } from "@/services/branches.service";
import {
  CheckboxCellButton,
} from "./NewRouteModal.styles";

export type RouteType = "deliveries" | "scheduled";
export type ScheduleType = "unique" | "weekly" | "monthly";

export type NewRouteFormValues = CreateRoutePayload;

export interface NewRouteFormErrors {
  routeType?: string;
  cityId?: string;
  originBranchId?: string;
  destinationBranchId?: string;
  deliveryDate?: string;
  originCityId?: string;
  mainBranchId?: string;
  destinationCityId?: string;
  branchesToVisit?: string;
  schedule?: string;
  scheduledDate?: string;
  weekdays?: string;
  monthDays?: string;
}

export interface NewRouteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: NewRouteFormValues) => void | Promise<void>;
  fetchCities: () => Promise<MunicipalityCatalogItem[]>;
  fetchBranches: () => Promise<BranchCatalogItem[]>;
  loading?: boolean;
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MIN_DATE = dayjs().add(1, "day").format("YYYY-MM-DD");

function isAfterTomorrow(dateStr: string): boolean {
  if (!dateStr) return false;
  const parsed = dayjs(dateStr, "YYYY-MM-DD", true);
  if (!parsed.isValid()) return false;
  return parsed.isAfter(dayjs().endOf("day"));
}

function buildPayload(values: NewRouteFormValues): CreateRoutePayload {
  const base: CreateRoutePayload = {
    route_type: values.route_type,
    city_id: values.city_id,
    branch_ids_to_visit: values.branch_ids_to_visit ?? [],
  };

  if (values.route_type === "deliveries") {
    return {
      ...base,
      origin_branch_id: values.origin_branch_id,
      destination_branch_id: values.destination_branch_id,
      delivery_date: values.delivery_date,
    };
  }

  return {
    ...base,
    origin_city_id: values.origin_city_id,
    main_branch_id: values.main_branch_id,
    destination_city_id: values.destination_city_id,
    branch_ids_to_visit: values.branch_ids_to_visit ?? [],
    schedule: values.schedule,
    scheduled_date: values.schedule === "unique" ? values.scheduled_date : undefined,
    weekdays: values.schedule === "weekly" ? values.weekdays : undefined,
    month_days: values.schedule === "monthly" ? values.month_days : undefined,
  };
}

export function NewRouteModal({
  open,
  onClose,
  onConfirm,
  fetchCities,
  fetchBranches,
  loading = false,
}: NewRouteModalProps) {
  const [cities, setCities] = useState<MunicipalityCatalogItem[]>([]);
  const [branches, setBranches] = useState<BranchCatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [routeType, setRouteType] = useState<RouteType>("deliveries");
  const [cityId, setCityId] = useState<number | "">("");
  const [originBranchId, setOriginBranchId] = useState<number | "">("");
  const [destinationBranchId, setDestinationBranchId] = useState<number | "">("");
  const [deliveryDate, setDeliveryDate] = useState<string>("");

  const [originCityId, setOriginCityId] = useState<number | "">("");
  const [mainBranchId, setMainBranchId] = useState<number | "">("");
  const [destinationCityId, setDestinationCityId] = useState<number | "">("");
  const [branchesToVisit, setBranchesToVisit] = useState<number[]>([]);
  const [schedule, setSchedule] = useState<ScheduleType>("unique");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [monthDays, setMonthDays] = useState<number[]>([]);

  const [errors, setErrors] = useState<NewRouteFormErrors>({});

  useEffect(() => {
    if (!open) {
      setRouteType("deliveries");
      setCityId("");
      setOriginBranchId("");
      setDestinationBranchId("");
      setDeliveryDate("");
      setOriginCityId("");
      setMainBranchId("");
      setDestinationCityId("");
      setBranchesToVisit([]);
      setSchedule("unique");
      setScheduledDate("");
      setWeekdays([]);
      setMonthDays([]);
      setErrors({});
      return;
    }

    let cancelled = false;
    setCatalogLoading(true);
    Promise.all([fetchCities(), fetchBranches()])
      .then(([citiesRes, branchesRes]) => {
        if (cancelled) return;
        setCities(citiesRes);
        setBranches(branchesRes);
      })
      .catch(() => {
        if (cancelled) return;
        setCities([]);
        setBranches([]);
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, fetchCities, fetchBranches]);

  const cityOptions = useMemo(
    () =>
      cities.map((c) => ({
        value: c.id,
        label: `${c.name}${c.stateName ? `, ${c.stateName}` : ""}`,
      })),
    [cities],
  );

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        value: b.id,
        label: b.name,
      })),
    [branches],
  );

  const branchChipsItems = useMemo(
    () => branches.map((b) => ({ id: b.id, label: b.name })),
    [branches],
  );

  const validate = (): NewRouteFormErrors => {
    const next: NewRouteFormErrors = {};
    if (!routeType) next.routeType = "Selecciona el tipo de ruta.";

    if (routeType === "deliveries") {
      if (cityId === "") next.cityId = "Selecciona una ciudad.";
      if (originBranchId === "")
        next.originBranchId = "Selecciona la sucursal de origen.";
      if (destinationBranchId === "")
        next.destinationBranchId = "Selecciona la sucursal de destino.";
      if (!deliveryDate)
        next.deliveryDate = "Selecciona la fecha a realizar.";
      else if (!isAfterTomorrow(deliveryDate))
        next.deliveryDate =
          "La fecha debe ser posterior al día de hoy.";
    } else {
      if (originCityId === "")
        next.originCityId = "Selecciona la ciudad de origen.";
      if (mainBranchId === "")
        next.mainBranchId = "Selecciona la sucursal.";
      if (destinationCityId === "")
        next.destinationCityId = "Selecciona la ciudad destino.";
      if (branchesToVisit.length === 0)
        next.branchesToVisit = "Selecciona al menos una sucursal a visitar.";
      if (!schedule) next.schedule = "Selecciona la programación.";

      if (schedule === "unique") {
        if (!scheduledDate)
          next.scheduledDate = "Selecciona la fecha.";
        else if (!isAfterTomorrow(scheduledDate))
          next.scheduledDate =
            "La fecha debe ser posterior al día de hoy.";
      } else if (schedule === "weekly") {
        if (weekdays.length === 0)
          next.weekdays = "Selecciona al menos un día de la semana.";
      } else if (schedule === "monthly") {
        if (monthDays.length === 0)
          next.monthDays = "Selecciona al menos un día del mes.";
      }
    }

    return next;
  };

  const handleConfirm = async () => {
    if (submitting) return;
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const values: NewRouteFormValues = {
      route_type: routeType,
      city_id: cityId as number,
      origin_branch_id:
        routeType === "deliveries" ? (originBranchId as number) : undefined,
      destination_branch_id:
        routeType === "deliveries"
          ? (destinationBranchId as number)
          : undefined,
      delivery_date:
        routeType === "deliveries" ? deliveryDate : undefined,
      origin_city_id:
        routeType === "scheduled" ? (originCityId as number) : undefined,
      main_branch_id:
        routeType === "scheduled" ? (mainBranchId as number) : undefined,
      destination_city_id:
        routeType === "scheduled"
          ? (destinationCityId as number)
          : undefined,
      branch_ids_to_visit: routeType === "scheduled" ? branchesToVisit : [],
      schedule: routeType === "scheduled" ? schedule : undefined,
      scheduled_date:
        routeType === "scheduled" && schedule === "unique"
          ? scheduledDate
          : undefined,
      weekdays:
        routeType === "scheduled" && schedule === "weekly"
          ? weekdays
          : undefined,
      month_days:
        routeType === "scheduled" && schedule === "monthly"
          ? monthDays
          : undefined,
    };

    const payload = buildPayload(values);

    setSubmitting(true);
    try {
      await onConfirm(payload);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting || loading) return;
    onClose();
  };

  const handleRouteTypeChange = (next: RouteType) => {
    if (submitting || loading) return;
    setRouteType(next);
    setErrors({});
  };

  const handleScheduleChange = (next: ScheduleType) => {
    if (submitting || loading) return;
    setSchedule(next);
    setWeekdays([]);
    setMonthDays([]);
    setScheduledDate("");
    setErrors((prev) => ({
      ...prev,
      weekdays: undefined,
      monthDays: undefined,
      scheduledDate: undefined,
    }));
  };

  const isSubmitting = submitting || loading;
  const fieldsDisabled = isSubmitting || catalogLoading;

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Nueva ruta"
      description="Configura los datos de la nueva ruta"
      maxWidth="md"
      disableClose={isSubmitting}
      headerActions={
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            type="button"
            variant="option"
            color="inherit"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => void handleConfirm()}
            sx={{ minWidth: "112px" }}
            disabled={isSubmitting}>
            Crear ruta
          </Button>
        </Stack>
      }>
      <Stack spacing={2}>
        <Stack spacing={1}>
          <Typography variant="body1" fontWeight={500}>Tipo de ruta</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <RadioButtonGroup sx={{ width: "100%" }}>
              <RadioButton
                value="deliveries"
                label="Entregas"
                checked={routeType === "deliveries"}
                onChange={() => handleRouteTypeChange("deliveries")}
                disabled={fieldsDisabled}
              />
              <RadioButton
                value="scheduled"
                label="Distribución programada"
                checked={routeType === "scheduled"}
                onChange={() => handleRouteTypeChange("scheduled")}
                disabled={fieldsDisabled}
              />
            </RadioButtonGroup>
            {
              errors.routeType && <Typography variant="caption" color="error">{errors.routeType}</Typography>
            }
          </Stack>
        </Stack>

        {
          (routeType === "deliveries") ?
            <>
              <FormSelect
                required
                fullWidth
                label="Ciudad"
                value={cityId === "" ? "" : String(cityId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setCityId(v === "" ? "" : Number(v));
                }}
                options={cityOptions}
                placeholder="Selecciona una ciudad"
                disabled={fieldsDisabled}
                error={Boolean(errors.cityId)}
                helperText={errors.cityId}
              />

              <Stack direction="row" spacing={1} alignItems="center">
                <FormSelect
                  label="Origen"
                  required
                  fullWidth
                  value={
                    originBranchId === "" ? "" : String(originBranchId)
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setOriginBranchId(v === "" ? "" : Number(v));
                  }}
                  options={branchOptions}
                  placeholder="Selecciona el origen"
                  disabled={fieldsDisabled}
                  error={Boolean(errors.originBranchId)}
                  helperText={errors.originBranchId}
                />
                <FormSelect
                  label="Destino"
                  required
                  fullWidth
                  value={
                    destinationBranchId === ""
                      ? ""
                      : String(destinationBranchId)
                  }
                  onChange={(e) => {
                    const v = e.target.value;
                    setDestinationBranchId(v === "" ? "" : Number(v));
                  }}
                  options={branchOptions}
                  placeholder="Selecciona el destino"
                  disabled={fieldsDisabled}
                  error={Boolean(errors.destinationBranchId)}
                  helperText={errors.destinationBranchId}
                />
              </Stack>

              <FormDatePicker
                label="Fecha a realizar"
                required
                value={deliveryDate}
                onChange={(v) => setDeliveryDate(v)}
                minDate={MIN_DATE}
                fullWidth
                disabled={fieldsDisabled}
                error={Boolean(errors.deliveryDate)}
                helperText={errors.deliveryDate}
              />
            </>
            :
            <>
              <FormSelect
                required
                fullWidth
                label="Ciudad de origen"
                value={originCityId === "" ? "" : String(originCityId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setOriginCityId(v === "" ? "" : Number(v));
                }}
                options={cityOptions}
                placeholder="Selecciona la ciudad de origen"
                disabled={fieldsDisabled}
                error={Boolean(errors.originCityId)}
                helperText={errors.originCityId}
              />

              <FormSelect
                required
                fullWidth
                label="Sucursal"
                value={mainBranchId === "" ? "" : String(mainBranchId)}
                onChange={(e) => {
                  const v = e.target.value;
                  setMainBranchId(v === "" ? "" : Number(v));
                }}
                options={branchOptions}
                placeholder="Selecciona la sucursal"
                disabled={fieldsDisabled}
                error={Boolean(errors.mainBranchId)}
                helperText={errors.mainBranchId}
              />

              <FormSelect
                required
                fullWidth
                label="Ciudad destino"
                value={
                  destinationCityId === "" ? "" : String(destinationCityId)
                }
                onChange={(e) => {
                  const v = e.target.value;
                  setDestinationCityId(v === "" ? "" : Number(v));
                }}
                options={cityOptions}
                placeholder="Selecciona la ciudad destino"
                disabled={fieldsDisabled}
                error={Boolean(errors.destinationCityId)}
                helperText={errors.destinationCityId}
              />

              <MultiSelectChips
                label="Sucursales a visitar"
                items={branchChipsItems}
                selectedIds={branchesToVisit}
                onChange={(ids) =>
                  setBranchesToVisit(ids.map((id) => Number(id)))
                }
                disabled={fieldsDisabled}
                error={Boolean(errors.branchesToVisit)}
                helperText={errors.branchesToVisit}
                emptyText="No hay opciones"
              />

              <Stack spacing={1}>
                <Typography variant="body1" fontWeight={500}>Programación</Typography>
                <RadioButtonGroup sx={{ width: "100%", flexWrap: "wrap" }}>
                  <RadioButton
                    value="unique"
                    label="Única"
                    checked={schedule === "unique"}
                    onChange={() => handleScheduleChange("unique")}
                    disabled={fieldsDisabled}
                  />
                  <RadioButton
                    value="weekly"
                    label="Cada semana"
                    checked={schedule === "weekly"}
                    onChange={() => handleScheduleChange("weekly")}
                    disabled={fieldsDisabled}
                  />
                  <RadioButton
                    value="monthly"
                    label="Cada mes"
                    checked={schedule === "monthly"}
                    onChange={() => handleScheduleChange("monthly")}
                    disabled={fieldsDisabled}
                  />
                </RadioButtonGroup>
                {
                  errors.schedule && <Typography variant="caption" color="error">{errors.schedule}</Typography>
                }
              </Stack>

              {
                schedule === "unique" &&
                <FormDatePicker
                  label="Fecha"
                  required
                  value={scheduledDate}
                  onChange={(v) => setScheduledDate(v)}
                  minDate={MIN_DATE}
                  fullWidth
                  disabled={fieldsDisabled}
                  error={Boolean(errors.scheduledDate)}
                  helperText={errors.scheduledDate}
                />
              }

              {
                schedule === "weekly" &&
                <Stack spacing={1}>
                  <Typography variant="body1" fontWeight={500}>Días de la semana</Typography>
                  <Grid container spacing={1} flexWrap="wrap">
                    {
                      WEEKDAY_LABELS.map((label, idx) => {
                        const selected = weekdays.includes(idx);
                        return (
                          <Grid key={label} size={{ xs: 'auto' }}>
                            <Checkbox
                              key={label}
                              value={label}
                              label={label}
                              checked={selected}
                              onChange={(e) => {
                                if (fieldsDisabled) return;
                                setWeekdays((prev) =>
                                  prev.includes(idx)
                                    ? prev.filter((d) => d !== idx)
                                    : [...prev, idx]);
                              }}
                              disabled={fieldsDisabled} />
                          </Grid>
                        );
                      })
                    }
                  </Grid>
                  {
                    errors.weekdays && <Typography variant="caption" color="error">{errors.weekdays}</Typography>
                  }
                </Stack>
              }

              {
                (schedule === "monthly") &&
                <Stack spacing={1}>
                  <Typography variant="body1" fontWeight={500}>Días del mes</Typography>
                  <Grid container spacing={1} flexWrap="wrap">
                    {
                      Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                        const selected = monthDays.includes(day);
                        return (
                          <Grid key={day} size={{ xs: 'auto' }}>
                            <Checkbox
                              key={day}
                              value={day.toString()}
                              label={day.toString()}
                              checked={selected}
                              onChange={(e) => {
                                if (fieldsDisabled) return;
                                setMonthDays((prev) =>
                                  prev.includes(day)
                                    ? prev.filter((d) => d !== day)
                                    : [...prev, day],
                                );
                              }}
                              disabled={fieldsDisabled}
                            />
                          </Grid>
                        );
                      })
                    }
                  </Grid>
                  {
                    errors.monthDays && <Typography variant="caption" color="error">{errors.monthDays}</Typography>
                  }
                </Stack>
              }
            </>
        }
      </Stack>
    </SideModal>
  );
}
