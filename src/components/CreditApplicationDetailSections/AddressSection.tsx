import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Props as GoogleMapReactProps } from "google-map-react";
import { Divider, Grid, Stack, Typography } from "@mui/material";
import { FormTextField, RadioButton } from "@/components";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { theme } from "@/styles/theme";
import { formatStreetAddressLine } from "@/utils/address";
import { StreetAddressFields } from "@/components/CreditApplicationForm/StreetAddressFields";

const GoogleMapReact = dynamic<GoogleMapReactProps>(() => import("google-map-react"), { ssr: false });

const DEFAULT_MAP_CENTER = {
  lat: 19.432608,
  lng: -99.133209,
};

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const RESIDENCE_TIME_UNIT_LABELS: Record<"months" | "years", string> = {
  months: "Meses",
  years: "Años",
};

function formatResidenceTime(value: number | null, unit: "months" | "years" | null): string {
  if (value === null || unit === null) {
    return "";
  }
  return `${value} ${RESIDENCE_TIME_UNIT_LABELS[unit]}`;
}

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
    const streetLine = formatStreetAddressLine(address);
    return [streetLine, neighborhoodCity, neighborhoodState, address.postalCode, "México"]
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
      .join(", ");
  }, [address, neighborhoodCity, neighborhoodState]);

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
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            label="Código Postal"
            value={address.postalCode}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Colonia" value={neighborhoodName} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Estado" value={neighborhoodState} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Ciudad" value={neighborhoodCity} readOnly fullWidth />
        </Grid>
        <StreetAddressFields
          street={address.street}
          externalNumber={address.externalNumber}
          internalNumber={address.internalNumber}
          fieldKeys={{
            street: "street",
            externalNumber: "externalNumber",
            internalNumber: "internalNumber",
          }}
          onFieldChange={() => undefined}
          readOnly
          required={false}
        />
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
                    {!fullAddress
                      ? "No hay dirección suficiente para ubicar el mapa."
                      : geocodeErrorMessage}
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
          <FormTextField
            label="Entre calles"
            value={address.betweenStreets}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1">Propiedad de la Vivienda</Typography>
          {address.housingOwnership}
          <Grid container spacing={1} mt={3}>
            <Grid size={{ xs: 6, sm: "auto" }}>
              <RadioButton
                value="own"
                label="Casa propia"
                checked={address.housingOwnership === "own"}
                readOnly
              />
            </Grid>
            <Grid size={{ xs: 6, sm: "auto" }}>
              <RadioButton
                value="rented"
                label="Alquilada"
                checked={address.housingOwnership === "rented"}
                readOnly
              />
            </Grid>
            <Grid size={{ xs: 6, sm: "auto" }}>
              <RadioButton
                value="paying"
                label="Pagandola"
                checked={address.housingOwnership === "paying"}
                readOnly
              />
            </Grid>
            <Grid size={{ xs: 6, sm: "auto" }}>
              <RadioButton
                value="relatives"
                label="Familiares"
                checked={address.housingOwnership === "relatives"}
                readOnly
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField
            label="Tiempo en el domicilio"
            value={formatResidenceTime(address.timeAtAddressValue, address.timeAtAddressUnit)}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <FormTextField
            label="Domicilio anterior"
            value={address.previousAddress}
            readOnly
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField
            label="Tiempo"
            value={formatResidenceTime(address.previousTimeValue, address.previousTimeUnit)}
            readOnly
            fullWidth
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
