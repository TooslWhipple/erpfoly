import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  Grid,
  Stack,
  Typography,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import { FormTextField } from "@/components/Form";
import { PostalCodeSettlementFields } from "@/components/CreditApplicationForm/PostalCodeSettlementFields";
import { StreetAddressFields } from "@/components/CreditApplicationForm/StreetAddressFields";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import { previewAddressGeocode } from "@/services/address.service";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { StaticLocationMap } from "@/components/StaticLocationMap/StaticLocationMap";
import { googleMapsBrowserApiKey } from "@/config/maps";

export interface DeliveryAddressDraft {
  neighborhoodFullCode: string;
  street: string;
  externalNumber: string;
  internalNumber?: string;
  postalCode: string;
}

export interface DeliveryAddressInitial {
  street?: string | null;
  externalNumber?: string | null;
  internalNumber?: string | null;
  postalCode?: string | null;
  neighborhoodFullCode?: string | null;
}

interface DeliveryAddressModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  initial?: DeliveryAddressInitial | null;
  onSubmit: (draft: DeliveryAddressDraft) => Promise<void>;
}

export interface DeliveryAddressSelection {
  id: number;
  formatted: string;
  latitude: number | null;
  longitude: number | null;
}

interface DeliveryAddressFormState {
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
}

const EMPTY_FORM: DeliveryAddressFormState = {
  postalCode: "",
  neighborhoodFullCode: "-1",
  state: "",
  city: "",
  street: "",
  externalNumber: "",
  internalNumber: "",
};

export function DeliveryAddressModal({
  open,
  title,
  onClose,
  initial,
  onSubmit,
}: DeliveryAddressModalProps) {
  const [form, setForm] = useState<DeliveryAddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [pin, setPin] = useState<{
    key: string;
    coords: { lat: number; lng: number } | null;
  } | null>(null);
  const [wasOpen, setWasOpen] = useState(false);
  const snackbar = useSnackbarStore();

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setForm({
        postalCode: initial?.postalCode?.trim() ?? "",
        neighborhoodFullCode: initial?.neighborhoodFullCode?.trim() || "-1",
        state: "",
        city: "",
        street: initial?.street?.trim() ?? "",
        externalNumber: initial?.externalNumber?.trim() ?? "",
        internalNumber: initial?.internalNumber?.trim() ?? "",
      });
      setPin(null);
      setSaving(false);
    }
  }

  const { data: neighborhoods = [], isLoading: neighborhoodsLoading } =
    useNeighborhoodsByPostalCode(form.postalCode);

  const mergePatch = (patch: Record<string, string>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const canSave =
    form.street.trim().length > 0 &&
    form.externalNumber.trim().length > 0 &&
    form.neighborhoodFullCode !== "-1" &&
    form.postalCode.trim().length === 5;

  const previewRequest =
    open && canSave
      ? {
          neighborhoodFullCode: form.neighborhoodFullCode,
          street: form.street.trim(),
          externalNumber: form.externalNumber.trim(),
          internalNumber: form.internalNumber.trim(),
          postalCode: form.postalCode,
        }
      : null;
  const previewKey = previewRequest ? JSON.stringify(previewRequest) : "";
  const locating = previewKey !== "" && pin?.key !== previewKey;
  const preview = pin?.key === previewKey ? pin.coords : null;
  const fieldsLocked = saving;

  useEffect(() => {
    if (!previewKey) return;
    const key = previewKey;
    const payload = JSON.parse(key) as {
      neighborhoodFullCode: string;
      street: string;
      externalNumber: string;
      internalNumber: string;
      postalCode: string;
    };
    const handle = window.setTimeout(() => {
      void previewAddressGeocode({
        neighborhoodFullCode: payload.neighborhoodFullCode,
        street: payload.street,
        externalNumber: payload.externalNumber,
        internalNumber: payload.internalNumber || undefined,
        postalCode: payload.postalCode,
      })
        .then((coords) =>
          setPin({ key, coords: { lat: coords.latitude, lng: coords.longitude } }),
        )
        .catch(() => setPin({ key, coords: null }));
    }, 400);
    return () => window.clearTimeout(handle);
  }, [previewKey]);

  const handleClose = () => {
    if (saving) return;
    setForm(EMPTY_FORM);
    setPin(null);
    onClose();
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        neighborhoodFullCode: form.neighborhoodFullCode,
        street: form.street.trim(),
        externalNumber: form.externalNumber.trim(),
        internalNumber: form.internalNumber.trim() || undefined,
        postalCode: form.postalCode,
      });
      setForm(EMPTY_FORM);
      setPin(null);
    } catch (error) {
      const toasted =
        error instanceof Error &&
        "apiError" in error &&
        Boolean((error as { apiError?: { message?: string } }).apiError?.message);
      if (!toasted) {
        snackbar.showError(
          error instanceof Error
            ? error.message
            : "No se pudo guardar la dirección, intenta nuevamente.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const mapPlaceholder = locating
    ? "Ubicando dirección…"
    : previewKey && pin?.coords == null && pin?.key === previewKey
      ? "No se pudo ubicar la dirección. Revisa calle y número."
      : "Completa calle, número y CP para ver el pin";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={saving}
    >
      <DialogContent sx={{ p: 3 }} aria-busy={saving}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>

          <Grid container spacing={2}>
            <PostalCodeSettlementFields
              postalCode={form.postalCode}
              neighborhoodFullCode={form.neighborhoodFullCode}
              state={form.state}
              city={form.city}
              neighborhoods={neighborhoods}
              neighborhoodsLoading={neighborhoodsLoading}
              disabled={fieldsLocked}
              fieldKeys={{
                postalCode: "postalCode",
                neighborhoodFullCode: "neighborhoodFullCode",
                state: "state",
                city: "city",
              }}
              mergePatch={mergePatch}
            />
            <StreetAddressFields
              street={form.street}
              externalNumber={form.externalNumber}
              internalNumber={form.internalNumber}
              disabled={fieldsLocked}
              fieldKeys={{
                street: "street",
                externalNumber: "externalNumber",
                internalNumber: "internalNumber",
              }}
              onFieldChange={(field, value) => mergePatch({ [field]: value })}
            />
            {form.state && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField fullWidth label="Estado" value={form.state} disabled readOnly />
              </Grid>
            )}
            {form.city && (
              <Grid size={{ xs: 12, md: 6 }}>
                <FormTextField fullWidth label="Ciudad" value={form.city} disabled readOnly />
              </Grid>
            )}
          </Grid>

          {preview && googleMapsBrowserApiKey && !locating ? (
            <StaticLocationMap coords={preview} apiKey={googleMapsBrowserApiKey} height={160} />
          ) : (
            <Box
              sx={{
                height: 120,
                bgcolor: "grey.100",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {locating ? <CircularProgress size={18} /> : null}
              <Typography variant="caption" color="text.secondary">
                {mapPlaceholder}
              </Typography>
            </Box>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button
              variant="outlined"
              disabled={saving}
              onClick={handleClose}
              sx={{ textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!canSave || saving || neighborhoodsLoading}
              onClick={handleSave}
              sx={{ textTransform: "none" }}
              startIcon={
                saving ? <CircularProgress size={16} color="inherit" /> : undefined
              }
            >
              {saving ? "Guardando…" : "Guardar dirección"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
