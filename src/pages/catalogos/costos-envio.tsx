import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { ShippingMunicipalityAutocomplete } from "@/components";
import {
  DividerSpace,
  LeftPanel,
  MainContent,
  PriceInput,
  RightPanel,
  SectionSubtitle,
  SectionTitle,
  ZoneColor,
  ZoneHeader,
  ZoneItem,
  ZoneList,
  ZoneName,
} from "@/styles/catalogos/costos-envio.styles";
import {
  getConfiguredMunicipalityShippingCatalog,
  getMunicipalityShippingConfig,
  upsertMunicipalityShippingConfig,
} from "@/services/shipping-costs.service";
import type {
  GeoJsonPolygon,
  GeoPoint,
  MapEditMode,
  MunicipalityShippingCatalogItem,
  MunicipalityShippingConfig,
  ShippingZone,
} from "@/types/shipping-costs.types";
import { usePermissions } from "@/hooks/usePermissions";
import { CATALOG_SHIPPING_COSTS_UPDATE } from "@/lib/permissions";
import {
  DEFAULT_ZONE_COLORS,
  getNextTempZoneId,
  getZonesMapViewport,
  isPersistedZoneId,
  mapPathToGeoJson,
  zoneToMapPath,
} from "@/utils/shipping-zones";
import { polygonsOverlap } from "@/utils/shipping-zones-geo";
import { geocodeMunicipality } from "@/utils/geocode-municipality";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";
const ShippingZonesMap = dynamic(
  () =>
    import("@/components/ShippingZonesMap/ShippingZonesMap").then(
      (module) => module.ShippingZonesMap,
    ),
  {
    ssr: false,
  },
);
function sanitizePriceInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) return cleaned.slice(0, 12);
  const intPart = cleaned.slice(0, dotIndex).slice(0, 12);
  const decPart = cleaned
    .slice(dotIndex + 1)
    .replace(/\./g, "")
    .slice(0, 2);
  if (decPart.length === 0 && cleaned.endsWith(".")) return `${intPart}.`;
  return decPart.length > 0 ? `${intPart}.${decPart}` : intPart;
}
function parseCurrencyInput(value: string): number {
  const parsed = Number.parseFloat(sanitizePriceInput(value));
  return Number.isFinite(parsed) ? parsed : 0;
}
function formatCurrency(value: number): string {
  return value.toFixed(2);
}
function hasZonesOverlap(zones: ShippingZone[]): boolean {
  const zonePaths = zones
    .map((zone) => zoneToMapPath(zone))
    .filter((path) => path.length >= 3);
  for (let i = 0; i < zonePaths.length; i++) {
    for (let j = i + 1; j < zonePaths.length; j++) {
      if (polygonsOverlap(zonePaths[i], zonePaths[j])) return true;
    }
  }
  return false;
}
function cloneConfig(
  config: MunicipalityShippingConfig,
): MunicipalityShippingConfig {
  return JSON.parse(JSON.stringify(config)) as MunicipalityShippingConfig;
}
function clonePolygon(polygon: GeoJsonPolygon): GeoJsonPolygon {
  return JSON.parse(JSON.stringify(polygon)) as GeoJsonPolygon;
}
export default function CostosEnvioPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();
  const canUpdateShippingCosts = hasPermission(CATALOG_SHIPPING_COSTS_UPDATE);
  const [municipalityId, setMunicipalityId] = useState<number | null>(null);
  const [serverSnapshot, setServerSnapshot] =
    useState<MunicipalityShippingConfig | null>(null);
  const [draftConfig, setDraftConfig] =
    useState<MunicipalityShippingConfig | null>(null);
  const [priceInZoneInput, setPriceInZoneInput] = useState("0.00");
  const [priceOutOfZoneInput, setPriceOutOfZoneInput] = useState("0.00");
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(
    undefined,
  );
  const [editMode, setEditMode] = useState<MapEditMode>({
    type: "idle",
  });
  const [mapSession, setMapSession] = useState(0);
  const editingZoneSnapshotRef = useRef<{
    zoneId: number;
    polygon: GeoJsonPolygon;
  } | null>(null);
  const hasAutoSelectedMunicipalityRef = useRef(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [confirmLeaveResolver, setConfirmLeaveResolver] = useState<
    ((value: boolean) => void) | null
  >(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const catalogQuery = useQuery<MunicipalityShippingCatalogItem[]>({
    queryKey: ["shipping-costs", "municipalities"],
    queryFn: async () => {
      const result = await getConfiguredMunicipalityShippingCatalog();
      if (result.error) throw new Error(result.error.message);
      return result.data ?? [];
    },
    staleTime: Infinity,
  });
  useEffect(() => {
    if (hasAutoSelectedMunicipalityRef.current || municipalityId != null)
      return;
    const first = catalogQuery.data?.[0];
    if (!first) return;
    hasAutoSelectedMunicipalityRef.current = true;
    setMunicipalityId(first.municipalityId);
  }, [catalogQuery.data, municipalityId]);
  const configQuery = useQuery({
    queryKey: ["shipping-costs", municipalityId],
    enabled: municipalityId != null,
    queryFn: async () => {
      if (municipalityId == null) throw new Error("Municipio requerido");
      const result = await getMunicipalityShippingConfig(municipalityId);
      if (result.error) throw new Error(result.error.message);
      if (!result.data) throw new Error("No se encontró configuración.");
      return result.data;
    },
  });
  useEffect(() => {
    if (!configQuery.data) return;
    if (municipalityId == null) return;
    if (configQuery.data.municipalityId !== municipalityId) return;
    const normalized = cloneConfig(configQuery.data);
    if (normalized.zones.length === 0) {
      normalized.mapCenter = null;
    }
    setServerSnapshot(cloneConfig(normalized));
    setDraftConfig(cloneConfig(normalized));
    setPriceInZoneInput(formatCurrency(normalized.priceInZone));
    setPriceOutOfZoneInput(formatCurrency(normalized.priceOutOfZone));
    editingZoneSnapshotRef.current = null;
    setEditMode({
      type: "idle",
    });
    setSelectedZoneId(undefined);
  }, [configQuery.data, municipalityId]);
  const mapViewportQuery = useQuery({
    queryKey: [
      "shipping-map-viewport",
      mapSession,
      draftConfig?.municipalityId,
      draftConfig?.municipalityName,
      draftConfig?.stateName,
    ],
    enabled: draftConfig != null,
    queryFn: async () => {
      if (!draftConfig) throw new Error("Configuración requerida");
      const zonesViewport = getZonesMapViewport(draftConfig.zones);
      if (zonesViewport) return zonesViewport;
      const center = await geocodeMunicipality(
        draftConfig.municipalityName,
        draftConfig.stateName,
      );
      return {
        center,
        zoom: draftConfig.mapDefaultZoom || 12,
      };
    },
    staleTime: 0,
    gcTime: 0,
  });
  const resetMapState = useCallback(() => {
    setMapSession((prev) => prev + 1);
  }, []);
  const hasDraftZone = useMemo(
    () => draftConfig?.zones.some((zone) => zone.id == null) ?? false,
    [draftConfig?.zones],
  );
  const isMapZoneEditing =
    editMode.type === "creating" || editMode.type === "editing";
  const isZoneMetadataLocked = editMode.type === "editing";
  useEffect(() => {
    if (!hasDraftZone || editMode.type === "creating") return;
    setEditMode({
      type: "creating",
    });
    setSelectedZoneId(undefined);
  }, [editMode.type, hasDraftZone]);
  const isDirty = useMemo(() => {
    if (!serverSnapshot || !draftConfig) return false;
    return JSON.stringify(serverSnapshot) !== JSON.stringify(draftConfig);
  }, [draftConfig, serverSnapshot]);
  const requestLeaveConfirmation = useCallback(() => {
    if (!isDirty) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      setConfirmLeaveResolver(() => resolve);
      setConfirmLeaveOpen(true);
    });
  }, [isDirty]);
  useUnsavedChangesGuard({
    isDirty,
    confirmLeave: requestLeaveConfirmation,
  });
  const saveMutation = useMutation({
    mutationFn: async (payload: MunicipalityShippingConfig) => {
      const result = await upsertMunicipalityShippingConfig(
        payload.municipalityId,
        {
          priceInZone: payload.priceInZone,
          priceOutOfZone: payload.priceOutOfZone,
          mapCenter: payload.mapCenter ?? undefined,
          mapDefaultZoom: payload.mapDefaultZoom,
          zones: payload.zones.map((zone) => ({
            ...zone,
            id: isPersistedZoneId(zone.id) ? zone.id : undefined,
          })),
        },
      );
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: async () => {
      setEditMode({
        type: "idle",
      });
      setSnackbar({
        open: true,
        severity: "success",
        message: "Cambios guardados correctamente.",
      });
      await queryClient.invalidateQueries({
        queryKey: ["shipping-costs", municipalityId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["shipping-costs", "municipalities"],
      });
    },
  });
  const handlePriceChange = useCallback(
    (field: "priceInZone" | "priceOutOfZone", value: string) => {
      const sanitized = sanitizePriceInput(value);
      if (field === "priceInZone") {
        setPriceInZoneInput(sanitized);
      } else {
        setPriceOutOfZoneInput(sanitized);
      }
      setDraftConfig((prev) =>
        prev == null
          ? prev
          : {
              ...prev,
              [field]: Math.max(0, parseCurrencyInput(sanitized)),
            },
      );
    },
    [],
  );
  const handlePriceBlur = useCallback(
    (field: "priceInZone" | "priceOutOfZone") => {
      setDraftConfig((prev) => {
        if (!prev) return prev;
        const nextValue = Math.max(0, prev[field]);
        const formatted = formatCurrency(nextValue);
        if (field === "priceInZone") {
          setPriceInZoneInput(formatted);
        } else {
          setPriceOutOfZoneInput(formatted);
        }
        return {
          ...prev,
          [field]: nextValue,
        };
      });
    },
    [],
  );
  const handleMapViewportChange = useCallback(
    (viewport: { center: GeoPoint; zoom: number }) => {
      setDraftConfig((prev) =>
        prev == null
          ? prev
          : {
              ...prev,
              mapCenter: viewport.center,
              mapDefaultZoom: viewport.zoom,
            },
      );
    },
    [],
  );
  const handleZonePathChange = useCallback(
    (zoneId: number | undefined, path: GeoPoint[]) => {
      setDraftConfig((prev) => {
        if (!prev) return prev;
        const polygon = mapPathToGeoJson(path);
        return {
          ...prev,
          zones: prev.zones.map((zone) =>
            zone.id === zoneId || (zoneId == null && zone.id == null)
              ? {
                  ...zone,
                  polygon,
                }
              : zone,
          ),
        };
      });
    },
    [],
  );
  const handleCreateZone = () => {
    if (!draftConfig) return;
    const nextColor =
      DEFAULT_ZONE_COLORS[
        draftConfig.zones.length % DEFAULT_ZONE_COLORS.length
      ];
    const nextZone: ShippingZone = {
      name: `Zona ${draftConfig.zones.length + 1}`,
      color: nextColor,
      sortOrder: draftConfig.zones.length,
      polygon: {
        type: "Polygon",
        coordinates: [[]],
      },
    };
    setDraftConfig({
      ...draftConfig,
      zones: [...draftConfig.zones, nextZone],
    });
    setEditMode({
      type: "creating",
    });
    setSelectedZoneId(undefined);
  };
  const handleFinishZoneMapEdit = () => {
    if (!draftConfig) return;
    const targetZone =
      editMode.type === "creating"
        ? draftConfig.zones.find((zone) => zone.id == null)
        : editMode.type === "editing"
          ? draftConfig.zones.find((zone) => zone.id === editMode.zoneId)
          : undefined;
    if (!targetZone) return;
    const rawPath = zoneToMapPath(targetZone);
    if (rawPath.length < 3) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Necesitas al menos 3 coordenadas para guardar una zona.",
      });
      return;
    }
    const isCreating = editMode.type === "creating";
    const finalPath = rawPath;
    if (finalPath.length < 3) {
      setSnackbar({
        open: true,
        severity: "error",
        message:
          "Los puntos deben formar un área válida. Agrega puntos más separados.",
      });
      return;
    }
    const tempId = isCreating
      ? getNextTempZoneId(draftConfig.zones)
      : undefined;
    const nextPolygon = mapPathToGeoJson(finalPath);
    const nextZones = draftConfig.zones.map((zone) => {
      const isTarget =
        (isCreating && zone.id == null) ||
        (editMode.type === "editing" && zone.id === editMode.zoneId);
      if (!isTarget) return zone;
      return isCreating
        ? {
            ...zone,
            id: tempId,
            polygon: nextPolygon,
          }
        : {
            ...zone,
            polygon: nextPolygon,
          };
    });
    if (hasZonesOverlap(nextZones)) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "No se permite solapar zonas. Ajusta los vértices.",
      });
      return;
    }
    setDraftConfig((prev) =>
      prev == null
        ? prev
        : {
            ...prev,
            zones: nextZones,
          },
    );
    editingZoneSnapshotRef.current = null;
    setEditMode({
      type: "idle",
    });
    if (isCreating && tempId != null) {
      setSelectedZoneId(tempId);
    }
  };
  const handleCancelZoneMapEdit = () => {
    if (editMode.type === "creating") {
      setDraftConfig((prev) =>
        prev == null
          ? prev
          : {
              ...prev,
              zones: prev.zones.filter((zone) => zone.id != null),
            },
      );
    } else if (editMode.type === "editing" && editingZoneSnapshotRef.current) {
      const snapshot = editingZoneSnapshotRef.current;
      setDraftConfig((prev) =>
        prev == null
          ? prev
          : {
              ...prev,
              zones: prev.zones.map((zone) =>
                zone.id === snapshot.zoneId
                  ? {
                      ...zone,
                      polygon: clonePolygon(snapshot.polygon),
                    }
                  : zone,
              ),
            },
      );
    }
    editingZoneSnapshotRef.current = null;
    setEditMode({
      type: "idle",
    });
  };
  const handleSaveChanges = async () => {
    if (!draftConfig || !municipalityId) return;
    if (isMapZoneEditing) {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Finaliza o cancela la edición de la zona antes de guardar.",
      });
      return;
    }
    if (hasZonesOverlap(draftConfig.zones)) {
      setSnackbar({
        open: true,
        severity: "error",
        message:
          "No se permite solapar zonas. Ajusta los vértices antes de guardar.",
      });
      return;
    }
    await saveMutation.mutateAsync(draftConfig);
  };
  const handleSelectMunicipalityFromCatalog = async (
    nextMunicipalityId: number | null,
  ) => {
    if (nextMunicipalityId === municipalityId) return;
    const allow = await requestLeaveConfirmation();
    if (!allow) return;
    hasAutoSelectedMunicipalityRef.current = true;
    resetMapState();
    setServerSnapshot(null);
    setDraftConfig(null);
    setEditMode({
      type: "idle",
    });
    setSelectedZoneId(undefined);
    if (nextMunicipalityId == null) {
      setMunicipalityId(null);
      return;
    }
    setMunicipalityId(nextMunicipalityId);
  };
  const handleZoneChange = useCallback(
    (
      zoneId: number | undefined,
      patch: Partial<Pick<ShippingZone, "name" | "color">>,
    ) => {
      setDraftConfig((prev) =>
        prev == null
          ? prev
          : {
              ...prev,
              zones: prev.zones.map((zone) =>
                zone.id === zoneId || (zoneId == null && zone.id == null)
                  ? {
                      ...zone,
                      ...patch,
                    }
                  : zone,
              ),
            },
      );
    },
    [],
  );
  const handleStartZoneEdit = (zone: ShippingZone) => {
    if (zone.id == null) return;
    editingZoneSnapshotRef.current = {
      zoneId: zone.id,
      polygon: clonePolygon(zone.polygon),
    };
    setEditMode({
      type: "editing",
      zoneId: zone.id,
    });
    setSelectedZoneId(zone.id);
  };
  const resolveConfirmLeave = (allow: boolean) => {
    setConfirmLeaveOpen(false);
    confirmLeaveResolver?.(allow);
    setConfirmLeaveResolver(null);
  };
  const catalogData = (catalogQuery.data ??
    []) as MunicipalityShippingCatalogItem[];
  const shouldShowInitialLoading =
    catalogQuery.isLoading &&
    catalogData.length === 0 &&
    municipalityId == null;
  if (shouldShowInitialLoading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Stack spacing={3}>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h5">Costos de envío</Typography>
        <Button
          variant="contained"
          onClick={handleSaveChanges}
          disabled={
            !canUpdateShippingCosts || !isDirty || saveMutation.isPending
          }
          startIcon={
            saveMutation.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : null
          }
        >
          Guardar cambios
        </Button>
      </Stack>

      <MainContent>
        <LeftPanel>
          <ShippingMunicipalityAutocomplete
            value={municipalityId}
            configuredMunicipalities={catalogData}
            disabled={!canUpdateShippingCosts || editMode.type !== "idle"}
            onChange={handleSelectMunicipalityFromCatalog}
          />

          {draftConfig == null ? (
            <SectionSubtitle>
              {municipalityId != null && configQuery.isLoading
                ? "Cargando configuración del municipio seleccionado..."
                : "Selecciona una ciudad para cargar o crear su configuración de costos de envío."}
            </SectionSubtitle>
          ) : (
            <>
              <SectionTitle>Configuración de costos de envío</SectionTitle>
              <SectionSubtitle>
                Define los costos de envío por municipio para dentro y fuera de
                zona.
              </SectionSubtitle>

              <PriceInput
                size="small"
                label="Costo dentro de zona"
                value={priceInZoneInput}
                disabled={!canUpdateShippingCosts || isMapZoneEditing}
                onChange={(event) =>
                  handlePriceChange("priceInZone", event.target.value)
                }
                onBlur={() => handlePriceBlur("priceInZone")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />

              <PriceInput
                size="small"
                label="Costo fuera de zona"
                value={priceOutOfZoneInput}
                disabled={!canUpdateShippingCosts || isMapZoneEditing}
                onChange={(event) =>
                  handlePriceChange("priceOutOfZone", event.target.value)
                }
                onBlur={() => handlePriceBlur("priceOutOfZone")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />

              <DividerSpace />

              <ZoneHeader>
                <SectionTitle>Configuración de zonas</SectionTitle>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!canUpdateShippingCosts || isMapZoneEditing}
                  onClick={handleCreateZone}
                >
                  Nueva
                </Button>
              </ZoneHeader>

              <ZoneList>
                {draftConfig.zones.map((zone, index) => (
                  <ZoneItem key={zone.id ?? `new-${index}`}>
                    <ZoneColor
                      style={{
                        backgroundColor: zone.color,
                      }}
                    />
                    <ZoneName
                      size="small"
                      value={zone.name}
                      disabled={!canUpdateShippingCosts || isZoneMetadataLocked}
                      onChange={(event) =>
                        handleZoneChange(zone.id, {
                          name: event.target.value,
                        })
                      }
                      placeholder={`Zona ${index + 1}`}
                    />
                    <PriceInput
                      size="small"
                      type="color"
                      value={zone.color}
                      disabled={!canUpdateShippingCosts || isZoneMetadataLocked}
                      onChange={(event) =>
                        handleZoneChange(zone.id, {
                          color: event.target.value,
                        })
                      }
                      sx={{
                        width: 46,
                      }}
                    />
                    <Button
                      variant="text"
                      size="small"
                      disabled={
                        !canUpdateShippingCosts ||
                        isMapZoneEditing ||
                        zone.id == null
                      }
                      onClick={() => handleStartZoneEdit(zone)}
                    >
                      Editar
                    </Button>
                  </ZoneItem>
                ))}
              </ZoneList>

              {isMapZoneEditing ? (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleFinishZoneMapEdit}
                    disabled={!canUpdateShippingCosts}
                  >
                    {editMode.type === "creating"
                      ? "Finalizar zona"
                      : "Terminar edición"}
                  </Button>
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleCancelZoneMapEdit}
                    disabled={!canUpdateShippingCosts}
                  >
                    Cancelar
                  </Button>
                </Box>
              ) : null}

              {isMapZoneEditing ? (
                <SectionSubtitle>
                  {editMode.type === "creating"
                    ? "Marca 3 puntos en el mapa para definir la zona. Después podrás arrastrar los vértices y añadir más desde los puntos intermedios."
                    : "Arrastra los vértices del polígono para ajustar la zona. Click derecho en un vértice para eliminarlo."}
                </SectionSubtitle>
              ) : null}
            </>
          )}
        </LeftPanel>

        <RightPanel>
          {draftConfig == null ? (
            <Box
              sx={{
                minHeight: 520,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 3,
              }}
            >
              {municipalityId != null && configQuery.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  Selecciona una ciudad para visualizar y editar sus zonas en el
                  mapa.
                </Typography>
              )}
            </Box>
          ) : mapViewportQuery.isLoading || !mapViewportQuery.data ? (
            <Box
              sx={{
                minHeight: 520,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={24} />
            </Box>
          ) : mapViewportQuery.isError ? (
            <Box
              sx={{
                minHeight: 520,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 3,
              }}
            >
              <Typography variant="body2" color="error" textAlign="center">
                {(mapViewportQuery.error as Error).message ||
                  "No se pudo centrar el mapa en la ciudad seleccionada."}
              </Typography>
            </Box>
          ) : (
            <ShippingZonesMap
              key={`shipping-map-${mapSession}-${draftConfig.municipalityId}`}
              initialCenter={mapViewportQuery.data.center}
              initialZoom={mapViewportQuery.data.zoom}
              zones={draftConfig.zones}
              canEdit={canUpdateShippingCosts}
              editMode={editMode}
              selectedZoneId={selectedZoneId}
              onZoneSelect={(zoneId) => setSelectedZoneId(zoneId)}
              onZonePathChange={handleZonePathChange}
              onViewportChange={handleMapViewportChange}
            />
          )}
        </RightPanel>
      </MainContent>

      <Dialog
        open={confirmLeaveOpen}
        onClose={() => resolveConfirmLeave(false)}
      >
        <DialogTitle>Cambios sin guardar</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Tienes cambios sin guardar. Si sales ahora, se perderán. ¿Deseas
            salir?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => resolveConfirmLeave(false)}>Quedarme</Button>
          <Button color="error" onClick={() => resolveConfirmLeave(true)}>
            Salir sin guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >
        <Alert
          onClose={() =>
            setSnackbar((prev) => ({
              ...prev,
              open: false,
            }))
          }
          severity={snackbar.severity}
          sx={{
            width: "100%",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
