import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Props as GoogleMapReactProps } from "google-map-react";
import { Divider, Grid, Stack, Typography, FormControlLabel, Switch, Radio, RadioGroup } from "@mui/material";
import { FormTextField, RadioButton } from "@/components";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { formControlLabelSpacingSx } from "./formControlLabelSpacing";
import { theme } from "@/styles/theme";

const GoogleMapReact = dynamic<GoogleMapReactProps>(() => import("google-map-react"), { ssr: false });

const DEFAULT_MAP_CENTER = {
  lat: 19.432608,
  lng: -99.133209,
};

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface MapCoordinates {
  lat: number;
  lng: number;
}

interface MapMarkerProps {
  lat: number;
  lng: number;
}

interface GeocoderResult {
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface GoogleMapsApi {
  Geocoder: new () => {
    geocode: (
      request: { address: string },
      callback: (results: GeocoderResult[] | null, status: string) => void,
    ) => void;
  };
  GeocoderStatus: {
    OK: string;
  };
}

function MapMarker({ lat, lng }: MapMarkerProps) {
  return (
    <div
      data-lat={lat}
      data-lng={lng}
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        border: "2px solid #FFFFFF",
        backgroundColor: theme.palette.app.chip.variants.error.color,
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.35)",
      }}
    />
  );
}

interface AddressSectionProps {
  detail: CreditApplicationDetail;
}

export function AddressSection({ detail }: AddressSectionProps) {
  const { address } = detail;
  const neighborhoodName = address.neighborhood?.name?.trim() || "No especificada";
  const neighborhoodState = address.neighborhood?.state?.trim() || "No especificado";
  const neighborhoodCity = address.neighborhood?.municipality?.trim() || "No especificada";
  const [markerPosition, setMarkerPosition] = useState<MapCoordinates | null>(null);
  const [googleMapsApi, setGoogleMapsApi] = useState<GoogleMapsApi | null>(null);
  const [geocodeErrorMessage, setGeocodeErrorMessage] = useState<string>("");

  const fullAddress = useMemo(() => {
    return [address.streetAndNumber, neighborhoodCity, neighborhoodState, address.postalCode, "México"]
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .join(", ");
  }, [address.postalCode, address.streetAndNumber, neighborhoodCity, neighborhoodState]);

  const handleGoogleApiLoaded = useCallback(({ maps }: { maps: GoogleMapsApi }) => {
    setGoogleMapsApi(maps);
  }, []);

  useEffect(() => {
    if (!googleMapsApi || !fullAddress) {
      return;
    }

    const geocoder = new googleMapsApi.Geocoder();

    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === googleMapsApi.GeocoderStatus.OK && results?.[0]) {
        const location = results[0].geometry.location;
        const coordinates = { lat: location.lat(), lng: location.lng() };
        setMarkerPosition(coordinates);
        setGeocodeErrorMessage("");
        return;
      }

      setMarkerPosition(null);
      setGeocodeErrorMessage("No se pudo localizar la dirección exacta.");
    });
  }, [fullAddress, googleMapsApi]);

  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Dirección</Typography>
        <Typography variant="body2" color="text.secondary">
          Información que será usada para realizar entrega de artículos a domicilio.
        </Typography>
      </Stack>
      <Divider />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Código Postal" value={address.postalCode} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Colonia" value={neighborhoodName} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Estado" value={neighborhoodState} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Ciudad" value={neighborhoodCity} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField label="Calle y número" value={address.streetAndNumber} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <div
            style={{
              height: "144px",
              backgroundColor: theme.palette.app.chip.background,
              border: `1px solid ${theme.palette.app.border}`,
              borderRadius: "16px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {GOOGLE_MAPS_API_KEY ? (
              <>
                {markerPosition ? (
                  <GoogleMapReact
                    bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
                    center={markerPosition}
                    defaultCenter={DEFAULT_MAP_CENTER}
                    defaultZoom={13}
                    zoom={16}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={handleGoogleApiLoaded}
                    options={{
                      fullscreenControl: false,
                      mapTypeControl: false,
                      streetViewControl: false,
                    }}
                  >
                    <MapMarker lat={markerPosition.lat} lng={markerPosition.lng} />
                  </GoogleMapReact>
                ) : (
                  <GoogleMapReact
                    bootstrapURLKeys={{ key: GOOGLE_MAPS_API_KEY }}
                    center={DEFAULT_MAP_CENTER}
                    defaultCenter={DEFAULT_MAP_CENTER}
                    defaultZoom={13}
                    zoom={13}
                    yesIWantToUseGoogleMapApiInternals
                    onGoogleApiLoaded={handleGoogleApiLoaded}
                    options={{
                      fullscreenControl: false,
                      mapTypeControl: false,
                      streetViewControl: false,
                    }}
                  />
                )}
                {!fullAddress || geocodeErrorMessage ? (
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
                    {!fullAddress ? "No hay dirección suficiente para ubicar el mapa." : geocodeErrorMessage}
                  </Typography>
                ) : null}
              </>
            ) : (
              <Stack height="100%" alignItems="center" justifyContent="center" px={2}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Configura `GOOGLE_MAPS_API_KEY` en el entorno para visualizar el mapa.
                </Typography>
              </Stack>
            )}
          </div>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField label="Entre calles" value={address.betweenStreets} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            label="Núm. de teléfono de quién recibirá los artículos"
            value={address.deliveryPhone}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField label="Nombre de quién recibe" value={address.receiverName} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            sx={formControlLabelSpacingSx}
            control={<Switch checked={address.useClientPhone} readOnly />}
            label="Utilizar número del cliente"
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Propiedad de la Vivienda</Typography>
          <Grid container spacing={1} mt={3}>
            <Grid size={{ xs: 6, md: 'auto' }}>
              <RadioButton value="own" label="Casa propia" checked={address.housingOwnership === "own"} readOnly />
            </Grid>
            <Grid size={{ xs: 6, md: 'auto' }}>
              <RadioButton value="rented" label="Alquilada" checked={address.housingOwnership === "rented"} readOnly />
            </Grid>
            <Grid size={{ xs: 6, md: 'auto' }}>
              <RadioButton value="paying" label="Pagandola" checked={address.housingOwnership === "paying"} readOnly />
            </Grid>
            <Grid size={{ xs: 6, md: 'auto' }}>
              <RadioButton value="relatives" label="Familiares" checked={address.housingOwnership === "relatives"} readOnly />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField label="Tiempo en el domicilio" value={address.timeAtAddress} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <FormTextField label="Domicilio anterior" value={address.previousAddress} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField label="Tiempo" value={address.previousTime} readOnly fullWidth />
        </Grid>
      </Grid>
    </Stack>
  );
}
