"use client";

import { useEffect, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useStore } from "@tanstack/react-form";
import { z } from "zod";
import { SideModal, MapMarker } from "@/components";
import { FormTextField } from "@/components/Form/FormTextField";
import {
  defineFormFields,
  FormField,
  useFormFromFields,
  type SchemaOutputFromFields,
} from "@/forms";
import {
  sanitizeMxPostalCodeInput,
  isValidMxPostalCode,
} from "@/forms/validation/schemas";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import {
  useBranchAddressGeocode,
  type BranchGeocodeAddressInput,
} from "@/hooks/branches/useBranchAddressGeocode";
import {
  createBranch,
  updateBranch,
  getAvailableBusinessSegments,
  type Branch,
  type BusinessSegmentItem,
} from "@/services/branches.service";
import { getZonesCatalog } from "@/services/zones-catalog.service";
import { theme } from "@/styles/theme";
import { googleMapsBrowserApiKey } from "@/config/maps";

const GoogleMapReact = dynamic(() => import("google-map-react"), {
  ssr: false,
});

const DEFAULT_MAP_CENTER = { lat: 19.432608, lng: -99.133209 };

interface BranchFormShape extends Record<string, unknown> {
  name: string;
  businessSegmentId: number | null;
  zoneId: number | null;
  postalCode: string;
  neighborhoodFullCode: string;
  neighborhoodName: string;
  state: string;
  municipality: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
  latitude: number | null;
  longitude: number | null;
}

const branchFormFields = defineFormFields<BranchFormShape>()([
  {
    name: "name",
    schema: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres.")
      .max(64, "El nombre no puede exceder 64 caracteres."),
    label: "Nombre de la sucursal",
    type: "text",
    placeholder: "Ej. Foly Muebles Centro",
  },
  {
    name: "businessSegmentId",
    schema: z.number().nullable(),
    label: "Segmento de negocio",
    when: () => false,
  },
  {
    name: "zoneId",
    schema: z.number().nullable(),
    label: "Zona",
    when: () => false,
  },
  {
    name: "postalCode",
    schema: z
      .string()
      .regex(/^\d{5}$/, "El código postal debe tener 5 dígitos."),
    label: "Código postal",
    type: "text",
    placeholder: "5 dígitos",
    filter: sanitizeMxPostalCodeInput,
  },
  {
    name: "neighborhoodFullCode",
    schema: z
      .string()
      .min(1, "Selecciona una colonia.")
      .refine((v) => v !== "-1", "Selecciona una colonia."),
    label: "Colonia",
    type: "select",
  },
  {
    name: "neighborhoodName",
    schema: z.string(),
    label: "Colonia (nombre)",
    when: () => false,
  },
  {
    name: "state",
    schema: z.string().min(1, "Selecciona una colonia válida."),
    label: "Estado",
    type: "text",
    disabled: true,
  },
  {
    name: "municipality",
    schema: z.string().min(1, "Selecciona una colonia válida."),
    label: "Municipio",
    type: "text",
    disabled: true,
  },
  {
    name: "street",
    schema: z
      .string()
      .min(1, "La calle es obligatoria.")
      .max(256, "La calle no puede exceder 256 caracteres."),
    label: "Calle",
    type: "text",
    placeholder: "Ej. Av. Revolución",
  },
  {
    name: "externalNumber",
    schema: z
      .string()
      .min(1, "El número exterior es obligatorio.")
      .max(32, "El número exterior no puede exceder 32 caracteres."),
    label: "Número exterior",
    type: "text",
    placeholder: "Ej. 742",
  },
  {
    name: "internalNumber",
    schema: z
      .string()
      .max(32, "El número interior no puede exceder 32 caracteres."),
    label: "Número interior",
    type: "text",
    placeholder: "Opcional",
  },
  {
    name: "latitude",
    schema: z.number().nullable(),
    label: "Latitud",
    type: "number",
    disabled: true,
  },
  {
    name: "longitude",
    schema: z.number().nullable(),
    label: "Longitud",
    type: "number",
    disabled: true,
  },
] as const);

type BranchFormValues = SchemaOutputFromFields<typeof branchFormFields>;

const EMPTY_DEFAULTS: BranchFormValues = {
  name: "",
  businessSegmentId: null,
  zoneId: null,
  postalCode: "",
  neighborhoodFullCode: "-1",
  neighborhoodName: "",
  state: "",
  municipality: "",
  street: "",
  externalNumber: "",
  internalNumber: "",
  latitude: null,
  longitude: null,
};

function branchToFormValues(branch: Branch): BranchFormValues {
  return {
    name: branch.name ?? "",
    businessSegmentId: branch.businessSegmentId ?? null,
    zoneId: branch.zoneId ?? null,
    postalCode: branch.postalCode ?? "",
    neighborhoodFullCode: branch.neighborhoodFullCode ?? "-1",
    neighborhoodName: branch.neighborhoodName ?? "",
    state: branch.state ?? "",
    municipality: branch.municipality ?? "",
    street: branch.street ?? "",
    externalNumber: branch.externalNumber ?? "",
    internalNumber: branch.internalNumber ?? "",
    latitude: branch.latitude ?? null,
    longitude: branch.longitude ?? null,
  };
}

type BranchSubmitPayload = {
  name: string;
  businessSegmentId?: number | null;
  zoneId?: number | null;
  postalCode?: string;
  neighborhoodFullCode?: string;
  neighborhoodName?: string;
  state?: string;
  municipality?: string;
  street?: string;
  externalNumber?: string;
  internalNumber?: string;
  latitude?: number;
  longitude?: number;
};

function valuesToPayload(value: BranchFormValues): BranchSubmitPayload {
  return {
    name: value.name.trim(),
    businessSegmentId: value.businessSegmentId ?? null,
    zoneId: value.zoneId ?? null,
    postalCode: value.postalCode || undefined,
    neighborhoodFullCode:
      value.neighborhoodFullCode && value.neighborhoodFullCode !== "-1"
        ? value.neighborhoodFullCode
        : undefined,
    neighborhoodName: value.neighborhoodName || undefined,
    state: value.state || undefined,
    municipality: value.municipality || undefined,
    street: value.street.trim() || undefined,
    externalNumber: value.externalNumber.trim() || undefined,
    internalNumber: value.internalNumber?.trim() || undefined,
    latitude: value.latitude ?? undefined,
    longitude: value.longitude ?? undefined,
  };
}

function hasUserEditedAddress(
  current: BranchFormValues,
  initial: BranchFormValues,
): boolean {
  return (
    current.street !== initial.street ||
    current.externalNumber !== initial.externalNumber ||
    current.internalNumber !== initial.internalNumber ||
    current.postalCode !== initial.postalCode ||
    current.neighborhoodFullCode !== initial.neighborhoodFullCode
  );
}

export interface BranchCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (branch: Branch) => void;
  /** Cuando se proporciona, el modal entra en modo edición con los valores de la sucursal. */
  branch?: Branch;
}

export function BranchCreateModal({
  open,
  onClose,
  onSuccess,
  branch,
}: BranchCreateModalProps) {
  const isEditMode = Boolean(branch);

  const formDefaults = useMemo<BranchFormValues>(
    () => (branch ? branchToFormValues(branch) : EMPTY_DEFAULTS),
    [branch],
  );

  const lastAppliedGeocodeKey = useRef<string | null>(
    branch && branch.latitude != null && branch.longitude != null
      ? `${branch.latitude}|${branch.longitude}`
      : null,
  );

  const handleSubmit = async (value: BranchFormValues) => {
    const payload = valuesToPayload(value);
    const result = branch
      ? await updateBranch(branch.id, payload)
      : await createBranch(payload);

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (result.data && onSuccess) {
      onSuccess(result.data);
    }
    onClose();
  };

  const { form, FormContent } = useFormFromFields<typeof branchFormFields>(
    branchFormFields,
    formDefaults,
    handleSubmit,
    { validateOn: "blur" },
  );

  const businessSegmentId = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).businessSegmentId,
  );
  const zoneId = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).zoneId,
  );
  const postalCode = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).postalCode,
  );
  const street = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).street,
  );
  const externalNumber = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).externalNumber,
  );
  const internalNumber = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).internalNumber,
  );
  const neighborhoodFullCode = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).neighborhoodFullCode,
  );
  const neighborhoodName = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).neighborhoodName,
  );
  const stateValue = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).state,
  );
  const municipalityValue = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).municipality,
  );
  const latitude = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).latitude,
  );
  const longitude = useStore(
    form.store,
    (s) => (s.values as BranchFormValues).longitude,
  );

  const businessSegmentsQuery = useQuery({
    queryKey: ["available-business-segments", branch?.id],
    queryFn: () => getAvailableBusinessSegments(branch?.id),
    enabled: open,
  });

  const businessSegments = useMemo(
    () => businessSegmentsQuery.data ?? [],
    [businessSegmentsQuery.data],
  );
  const businessSegmentsLoading = businessSegmentsQuery.isFetching;

  const businessSegmentOptions = useMemo(() => {
    return businessSegments.map((s) => ({
      id: s.id,
      label: s.codigo ? `${s.codigo} - ${s.nombre}` : s.nombre,
    }));
  }, [businessSegments]);

  const selectedBusinessSegmentOption = useMemo(() => {
    if (businessSegmentId == null) return null;
    const found = businessSegmentOptions.find((opt) => opt.id === businessSegmentId);
    if (found) return found;
    if (branch?.businessSegment && branch.businessSegment.id === businessSegmentId) {
      const bs = branch.businessSegment;
      return {
        id: bs.id,
        label: bs.codigo ? `${bs.codigo} - ${bs.nombre}` : bs.nombre,
      };
    }
    return { id: businessSegmentId, label: `Segmento #${businessSegmentId}` };
  }, [businessSegmentId, businessSegmentOptions, branch?.businessSegment]);

  const zonesQuery = useQuery({
    queryKey: ["catalog", "zones", "branch-form"],
    queryFn: () => getZonesCatalog(),
    enabled: open,
  });

  const zones = useMemo(() => zonesQuery.data ?? [], [zonesQuery.data]);
  const zonesLoading = zonesQuery.isFetching;

  const zoneOptions = useMemo(() => {
    return zones.map((z) => ({
      id: z.id,
      label: z.name,
    }));
  }, [zones]);

  const selectedZoneOption = useMemo(() => {
    if (zoneId == null) return null;
    const found = zoneOptions.find((opt) => opt.id === zoneId);
    if (found) return found;
    if (branch?.zoneName) {
      return { id: zoneId, label: branch.zoneName };
    }
    return { id: zoneId, label: `Zona #${zoneId}` };
  }, [zoneId, zoneOptions, branch?.zoneName]);

  const trimmedPostalCode = postalCode.trim();
  const postalReady = isValidMxPostalCode(trimmedPostalCode);
  const neighborhoodsQuery = useNeighborhoodsByPostalCode(postalCode);
  const neighborhoods = useMemo(
    () => neighborhoodsQuery.data ?? [],
    [neighborhoodsQuery.data],
  );
  const neighborhoodsLoading = neighborhoodsQuery.isFetching;

  useEffect(() => {
    if (!neighborhoodFullCode || neighborhoodFullCode === "-1") {
      if (stateValue || municipalityValue || neighborhoodName) {
        form.setFieldValue("state", "");
        form.setFieldValue("municipality", "");
        form.setFieldValue("neighborhoodName", "");
      }
      return;
    }
    const row = neighborhoods.find(
      (item) => item.full_code === neighborhoodFullCode,
    );
    if (!row) return;
    if (stateValue !== row.state_name) {
      form.setFieldValue("state", row.state_name ?? "");
    }
    if (municipalityValue !== row.municipality_name) {
      form.setFieldValue("municipality", row.municipality_name ?? "");
    }
    if (neighborhoodName !== row.name) {
      form.setFieldValue("neighborhoodName", row.name ?? "");
    }
  }, [
    neighborhoodFullCode,
    neighborhoods,
    stateValue,
    municipalityValue,
    neighborhoodName,
    form,
  ]);

  const neighborhoodOptions = useMemo(() => {
    const base: { value: string; label: string }[] = [
      {
        value: "-1",
        label: neighborhoodsLoading
          ? "Cargando..."
          : postalReady
            ? "Selecciona una colonia"
            : "Ingresa el código postal",
      },
    ];
    return base.concat(
      neighborhoods.map((row) => ({
        value: row.full_code,
        label: row.name,
      })),
    );
  }, [neighborhoods, neighborhoodsLoading, postalReady]);

  const geocodeAddress: BranchGeocodeAddressInput = useMemo(
    () => ({
      street,
      externalNumber,
      internalNumber,
      neighborhoodName,
      municipality: municipalityValue,
      state: stateValue,
      postalCode: trimmedPostalCode,
    }),
    [
      street,
      externalNumber,
      internalNumber,
      neighborhoodName,
      municipalityValue,
      stateValue,
      trimmedPostalCode,
    ],
  );

  const geocodeQuery = useBranchAddressGeocode(geocodeAddress);

  useEffect(() => {
    if (geocodeQuery.isPending) return;
    if (geocodeQuery.isError) {
      lastAppliedGeocodeKey.current = null;
      return;
    }
    const data = geocodeQuery.data;
    if (!data) {
      lastAppliedGeocodeKey.current = null;
      return;
    }
    const key = `${data.lat}|${data.lng}`;
    if (lastAppliedGeocodeKey.current === key) return;

    if (
      branch &&
      branch.latitude != null &&
      branch.longitude != null &&
      !hasUserEditedAddress(
        form.store.state.values as BranchFormValues,
        formDefaults,
      )
    ) {
      lastAppliedGeocodeKey.current = key;
      return;
    }

    lastAppliedGeocodeKey.current = key;
    form.setFieldValue("latitude", data.lat);
    form.setFieldValue("longitude", data.lng);
  }, [
    geocodeQuery.data,
    geocodeQuery.isPending,
    geocodeQuery.isError,
    form,
    branch,
    formDefaults,
  ]);

  const hasCoordinates =
    typeof latitude === "number" && typeof longitude === "number";

  const mapHeight = 280;

  return (
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>{([canSubmit, isSubmitting]) => (
      <SideModal
        open={open}
        onClose={onClose}
        title={isEditMode ? "Editar sucursal" : "Nueva sucursal"}
        description={
          isEditMode
            ? "Modifica los datos de la sucursal."
            : "Captura los datos de ubicación de la nueva sucursal."
        }
        maxWidth="md"
        headerActions={
          <HeaderSubmitButton
            disabled={!canSubmit || isSubmitting}
            loading={isSubmitting}
            onClick={() => form.handleSubmit()}
          />
        }
        disableClose={isSubmitting}>
        <FormContent asForm skipFieldBody>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormField
                  form={form}
                  name="name"
                  label="Nombre de la sucursal"
                  type="text"
                  placeholder="Ej. Foly Muebles Centro"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete<{ id: number; label: string }, false, false, false>
                  options={zoneOptions}
                  value={selectedZoneOption}
                  loading={zonesLoading}
                  getOptionLabel={(opt) => opt.label}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  onChange={(_, newValue) => {
                    form.setFieldValue(
                      "zoneId",
                      newValue ? newValue.id : null,
                    );
                  }}
                  noOptionsText="Sin zonas disponibles"
                  renderInput={(params) => (
                    <FormTextField
                      {...params}
                      label="Zona"
                      placeholder="Seleccionar zona"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete<{ id: number; label: string }, false, false, false>
                  options={businessSegmentOptions}
                  value={selectedBusinessSegmentOption}
                  loading={businessSegmentsLoading}
                  getOptionLabel={(opt) => opt.label}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  onChange={(_, newValue) => {
                    form.setFieldValue(
                      "businessSegmentId",
                      newValue ? newValue.id : null,
                    );
                  }}
                  noOptionsText="Sin segmentos disponibles"
                  renderInput={(params) => (
                    <FormTextField
                      {...params}
                      label="Segmento de negocio"
                      placeholder="Buscar segmento de negocio"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormField
                  form={form}
                  name="street"
                  label="Calle"
                  placeholder="Ej. Av. Revolución"
                  required
                  slotProps={{ htmlInput: { maxLength: 256 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  form={form}
                  name="postalCode"
                  label="Código postal"
                  placeholder="5 dígitos"
                  required
                  slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 5 } }}
                  filter={sanitizeMxPostalCodeInput}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  form={form}
                  name="neighborhoodFullCode"
                  label="Colonia"
                  type="select"
                  required
                  options={neighborhoodOptions}
                  disabled={!postalReady || neighborhoodsLoading}
                  helperText={
                    !postalReady
                      ? "Ingresa primero el código postal"
                      : neighborhoods.length === 0 && !neighborhoodsLoading
                        ? "No hay colonias para este código postal."
                        : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  form={form}
                  name="state"
                  label="Estado"
                  type="text"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  form={form}
                  name="municipality"
                  label="Municipio"
                  type="text"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormField
                  form={form}
                  name="externalNumber"
                  label="Número exterior"
                  placeholder="Ej. 742"
                  required
                  slotProps={{ htmlInput: { maxLength: 32 } }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormField
                  form={form}
                  name="internalNumber"
                  label="Número interior"
                  placeholder="Opcional"
                  slotProps={{ htmlInput: { maxLength: 32 } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  form={form}
                  name="latitude"
                  label="Latitud"
                  type="number"
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormField
                  form={form}
                  name="longitude"
                  label="Longitud"
                  type="number"
                  disabled
                />
              </Grid>
            </Grid>

            <MapSection
              latitude={hasCoordinates ? (latitude as number) : null}
              longitude={hasCoordinates ? (longitude as number) : null}
              height={mapHeight}
              isLoading={geocodeQuery.isFetching}
              errorMessage={
                geocodeQuery.isError
                  ? "No se pudo obtener la ubicación."
                  : null
              }
            />
          </Stack>
        </FormContent>
      </SideModal>
    )}
    </form.Subscribe>
  );
}

interface MapSectionProps {
  latitude: number | null;
  longitude: number | null;
  height: number;
  isLoading: boolean;
  errorMessage: string | null;
}

function safeDistanceToMouse(
  markerPos?: { x: number; y: number },
  mousePos?: { x: number; y: number },
): number {
  if (!markerPos || !mousePos || typeof markerPos.x !== "number" || typeof mousePos.x !== "number") {
    return Infinity;
  }
  return Math.sqrt((markerPos.x - mousePos.x) ** 2 + (markerPos.y - mousePos.y) ** 2);
}

function MapSection({
  latitude,
  longitude,
  height,
  isLoading,
  errorMessage,
}: MapSectionProps) {
  const numLat = latitude != null ? Number(latitude) : null;
  const numLng = longitude != null ? Number(longitude) : null;
  const hasCoordinates =
    numLat != null &&
    numLng != null &&
    Number.isFinite(numLat) &&
    Number.isFinite(numLng);

  const center = hasCoordinates
    ? { lat: numLat, lng: numLng }
    : DEFAULT_MAP_CENTER;
  const zoom = hasCoordinates ? 16 : 13;

  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="subtitle2">Ubicación</Typography>
        {isLoading ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              Buscando coordenadas...
            </Typography>
          </Stack>
        ) : null}
      </Stack>
      <div
        style={{
          height: `${height}px`,
          backgroundColor: theme.palette.app.chip.background,
          border: `1px solid ${theme.palette.app.border}`,
          borderRadius: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {googleMapsBrowserApiKey ? (
          <GoogleMapReact
            bootstrapURLKeys={{ key: googleMapsBrowserApiKey }}
            center={center}
            defaultCenter={DEFAULT_MAP_CENTER}
            defaultZoom={13}
            zoom={zoom}
            distanceToMouse={safeDistanceToMouse}
            options={{
              fullscreenControl: false,
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {hasCoordinates ? (
              <MapMarker lat={numLat} lng={numLng} />
            ) : null}
          </GoogleMapReact>
        ) : (
          <Stack
            height="100%"
            alignItems="center"
            justifyContent="center"
            px={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Configura `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para visualizar el
              mapa.
            </Typography>
          </Stack>
        )}

        {errorMessage ? (
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              left: 8,
              right: 8,
              bottom: 8,
              px: 1,
              py: 0.5,
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          >
            {errorMessage}
          </Typography>
        ) : null}
      </div>
    </Stack>
  );
}

function HeaderSubmitButton({
  disabled,
  loading,
  onClick,
}: {
  disabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="contained"
      color="primary"
      disabled={disabled}
      onClick={onClick}
      sx={{ minWidth: 120 }}
    >
      {loading ? (
        <CircularProgress size={18} color="inherit" />
      ) : (
        "Guardar"
      )}
    </Button>
  );
}
