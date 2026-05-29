import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GoogleMapReact from "google-map-react";
import { Typography } from "@mui/material";
import { googleMapsBrowserApiKey, googleMapsMapId } from "@/config/maps";
import type {
  GeoPoint,
  MapEditMode,
  ShippingZone,
} from "@/types/shipping-costs.types";
import { zoneToMapPath } from "@/utils/shipping-zones";
import {
  isPointInsideAnyPolygon,
  polygonsOverlap,
  resolveClickPoint,
} from "@/utils/shipping-zones-geo";
import { MapPlaceholderLarge } from "@/styles/rutas.styles";

const INITIAL_CREATE_POINTS = 3;

interface GoogleMapsLike {
  Polygon: new (options: Record<string, unknown>) => {
    setMap: (map: unknown) => void;
    getPath: () => {
      getLength: () => number;
      getAt: (index: number) => { lat: () => number; lng: () => number };
      addListener: (eventName: string, callback: (...args: unknown[]) => void) => { remove: () => void };
      removeAt: (index: number) => void;
    };
    addListener: (eventName: string, callback: (...args: unknown[]) => void) => { remove: () => void };
  };
  LatLngBounds: new () => {
    extend: (point: GeoPoint) => void;
  };
  SymbolPath: {
    CIRCLE: number;
  };
  Marker: new (options: Record<string, unknown>) => {
    setMap: (map: unknown) => void;
  };
}

const PLACEMENT_POINT_SYMBOL_SCALE = 12;

interface ShippingZonesMapProps {
  initialCenter: GeoPoint;
  initialZoom: number;
  zones: ShippingZone[];
  canEdit: boolean;
  editMode: MapEditMode;
  selectedZoneId?: number;
  onZoneSelect: (zoneId: number | undefined) => void;
  onZonePathChange: (zoneId: number | undefined, path: GeoPoint[]) => void;
  onViewportChange: (viewport: { center: GeoPoint; zoom: number }) => void;
}

export function ShippingZonesMap({
  initialCenter,
  initialZoom,
  zones,
  canEdit,
  editMode,
  selectedZoneId,
  onZoneSelect,
  onZonePathChange,
  onViewportChange,
}: ShippingZonesMapProps) {
  const mapRef = useRef<{
    addListener: (eventName: string, callback: () => void) => { remove: () => void };
    getCenter: () => { lat: () => number; lng: () => number } | null;
    getZoom: () => number | undefined;
    fitBounds: (bounds: unknown, padding?: number) => void;
  } | null>(null);
  const mapsRef = useRef<GoogleMapsLike | null>(null);
  const polygonsRef = useRef<Array<{ setMap: (map: unknown) => void }>>([]);
  const markersRef = useRef<Array<{ setMap: (map: unknown) => void }>>([]);
  const listenersRef = useRef<Array<{ remove: () => void }>>([]);
  const suppressNextViewportSyncRef = useRef(false);
  const hasSyncedInitialViewportRef = useRef(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const initialViewportRef = useRef({ center: initialCenter, zoom: initialZoom });

  const editingZoneId = editMode.type === "editing" ? editMode.zoneId : undefined;
  const isCreatingMode = editMode.type === "creating";
  const isEditingMode = editMode.type === "editing";

  const creatingZone = useMemo(
    () => (isCreatingMode ? zones.find((zone) => zone.id == null) : undefined),
    [isCreatingMode, zones]
  );

  const creatingPathLength = creatingZone ? zoneToMapPath(creatingZone).length : 0;
  const isCreatingPlacement = isCreatingMode && creatingPathLength < INITIAL_CREATE_POINTS;

  const getOtherPolygons = useCallback(
    (excludeZoneId: number | undefined): GeoPoint[][] =>
      zones
        .filter((zone) => {
          if (excludeZoneId != null) {
            return zone.id !== excludeZoneId;
          }
          return zone.id != null;
        })
        .map((zone) => zoneToMapPath(zone))
        .filter((path) => path.length >= 3),
    [zones]
  );

  const clearOverlays = useCallback(() => {
    for (const listener of listenersRef.current) listener.remove();
    listenersRef.current = [];
    for (const polygon of polygonsRef.current) polygon.setMap(null);
    polygonsRef.current = [];
    for (const marker of markersRef.current) marker.setMap(null);
    markersRef.current = [];
  }, []);

  const handleApiLoaded = useCallback(
    ({ map, maps }: { map: unknown; maps: unknown }) => {
      mapRef.current = map as {
        addListener: (eventName: string, callback: () => void) => { remove: () => void };
        getCenter: () => { lat: () => number; lng: () => number } | null;
        getZoom: () => number | undefined;
        fitBounds: (bounds: unknown, padding?: number) => void;
      };
      mapsRef.current = maps as GoogleMapsLike;
      setMapError(null);
      setMapReady(true);
    },
    []
  );

  useEffect(() => {
    hasSyncedInitialViewportRef.current = false;
  }, [initialCenter.lat, initialCenter.lng, initialZoom]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const idleListener = map.addListener("idle", () => {
      if (suppressNextViewportSyncRef.current) {
        suppressNextViewportSyncRef.current = false;
        return;
      }
      if (!hasSyncedInitialViewportRef.current) {
        hasSyncedInitialViewportRef.current = true;
        return;
      }
      const center = map.getCenter();
      const zoom = map.getZoom();
      if (!center || zoom == null) return;
      onViewportChange({
        center: { lat: center.lat(), lng: center.lng() },
        zoom,
      });
    });
    return () => idleListener.remove();
  }, [onViewportChange]);

  useEffect(() => {
    if (!mapRef.current || !mapsRef.current) return;
    const map = mapRef.current;
    const maps = mapsRef.current;

    clearOverlays();

    const bindEditablePolygon = (
      polygon: InstanceType<GoogleMapsLike["Polygon"]>,
      zoneId: number | undefined
    ) => {
      const pathObj = polygon.getPath();
      const syncEditedPath = () => {
        const nextPath: GeoPoint[] = [];
        for (let i = 0; i < pathObj.getLength(); i++) {
          const point = pathObj.getAt(i);
          nextPath.push({ lat: point.lat(), lng: point.lng() });
        }
        const otherPolygons = getOtherPolygons(zoneId);
        const snappedPath = nextPath.map((point) =>
          resolveClickPoint(point, otherPolygons)
        );
        if (otherPolygons.some((polygonPath) => polygonsOverlap(snappedPath, polygonPath))) {
          return;
        }
        onZonePathChange(zoneId, snappedPath);
      };

      listenersRef.current.push(pathObj.addListener("set_at", syncEditedPath));
      listenersRef.current.push(pathObj.addListener("insert_at", syncEditedPath));
      listenersRef.current.push(pathObj.addListener("remove_at", syncEditedPath));
      listenersRef.current.push(
        polygon.addListener("rightclick", (...args: unknown[]) => {
          const event = (args[0] ?? null) as { vertex?: number } | null;
          if (typeof event?.vertex !== "number") return;
          if (pathObj.getLength() <= 3) return;
          pathObj.removeAt(event.vertex);
          syncEditedPath();
        })
      );
    };

    zones.forEach((zone) => {
      const path = zoneToMapPath(zone);
      const isCreatingDraft = isCreatingMode && zone.id == null;
      const isEditingActive = isEditingMode && zone.id === editingZoneId;
      const isCreatingShapePhase = isCreatingDraft && path.length >= INITIAL_CREATE_POINTS;
      const isPolygonEditable =
        canEdit && (isEditingActive || isCreatingShapePhase);
      const isActiveZone = isEditingActive || isCreatingDraft;

      if (path.length >= INITIAL_CREATE_POINTS) {
        const polygon = new maps.Polygon({
          paths: path,
          strokeColor: zone.color,
          strokeOpacity: 1,
          strokeWeight: selectedZoneId === zone.id ? 3 : 2,
          fillColor: zone.color,
          fillOpacity: isActiveZone ? 0.22 : 0.3,
          editable: isPolygonEditable,
          clickable: !isActiveZone,
          map,
        });

        polygonsRef.current.push(polygon);

        listenersRef.current.push(
          polygon.addListener("click", () => {
            onZoneSelect(zone.id);
          })
        );

        if (isPolygonEditable) {
          bindEditablePolygon(polygon, isCreatingDraft ? undefined : zone.id);
        }
      }

      if (isCreatingDraft && path.length > 0 && path.length < INITIAL_CREATE_POINTS) {
        path.forEach((point) => {
          const marker = new maps.Marker({
            position: point,
            map,
            icon: {
              path: maps.SymbolPath.CIRCLE,
              fillColor: zone.color,
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2.5,
              scale: PLACEMENT_POINT_SYMBOL_SCALE,
            },
            clickable: false,
            zIndex: 3,
          });
          markersRef.current.push(marker);
        });
      }
    });

    const allPoints = zones
      .filter((zone) => zoneToMapPath(zone).length >= INITIAL_CREATE_POINTS)
      .flatMap((zone) => zoneToMapPath(zone));
    const shouldAutoFit = editMode.type === "idle";
    if (shouldAutoFit && allPoints.length > 0) {
      const bounds = new maps.LatLngBounds();
      allPoints.forEach((point) => bounds.extend(point));
      suppressNextViewportSyncRef.current = true;
      map.fitBounds(bounds, 40);
    }

    return clearOverlays;
  }, [
    canEdit,
    clearOverlays,
    editMode.type,
    editingZoneId,
    getOtherPolygons,
    isCreatingMode,
    isEditingMode,
    mapReady,
    onZonePathChange,
    onZoneSelect,
    selectedZoneId,
    zones,
  ]);

  const handleMapClick = useCallback(
    ({ lat, lng }: { lat: number; lng: number }) => {
      if (!canEdit || !isCreatingPlacement || !creatingZone) return;

      const currentPath = zoneToMapPath(creatingZone);
      if (currentPath.length >= INITIAL_CREATE_POINTS) return;

      const clickPoint = { lat, lng };
      const otherPolygons = getOtherPolygons(undefined);
      if (isPointInsideAnyPolygon(clickPoint, otherPolygons)) {
        return;
      }

      const nextPath = [...currentPath, clickPoint];
      if (
        nextPath.length >= INITIAL_CREATE_POINTS &&
        otherPolygons.some((polygonPath) => polygonsOverlap(nextPath, polygonPath))
      ) {
        return;
      }

      onZonePathChange(undefined, nextPath);
    },
    [canEdit, creatingZone, getOtherPolygons, isCreatingPlacement, onZonePathChange]
  );

  if (!googleMapsBrowserApiKey) {
    return (
      <MapPlaceholderLarge>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          Configura NEXT_PUBLIC_GOOGLE_MAPS_API_KEY para ver el mapa.
        </Typography>
      </MapPlaceholderLarge>
    );
  }

  if (mapError) {
    return (
      <MapPlaceholderLarge>
        <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
          {mapError}
        </Typography>
      </MapPlaceholderLarge>
    );
  }

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 520 }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: googleMapsBrowserApiKey }}
        defaultCenter={initialViewportRef.current.center}
        defaultZoom={initialViewportRef.current.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={handleApiLoaded}
        onClick={handleMapClick}
        options={{
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          clickableIcons: false,
          mapId: googleMapsMapId || undefined,
          draggableCursor: canEdit && isCreatingPlacement ? "crosshair" : undefined,
        }}
      />
    </div>
  );
}
