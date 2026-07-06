import { useState } from "react";
import { Dialog, DialogContent, Grid, Stack, Typography, Button } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { PostalCodeSettlementFields } from "@/components/CreditApplicationForm/PostalCodeSettlementFields";
import { StreetAddressFields } from "@/components/CreditApplicationForm/StreetAddressFields";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import { createAddress } from "@/services/address.service";
import { formatStreetAddressLine } from "@/utils/address";
import { useSnackbarStore } from "@/store/useSnackbarStore";

interface DeliveryAddressModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (address: { id: number; formatted: string }) => void;
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

export function DeliveryAddressModal({ open, onClose, onSaved }: DeliveryAddressModalProps) {
  const [form, setForm] = useState<DeliveryAddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const snackbar = useSnackbarStore();

  const { data: neighborhoods = [], isLoading: neighborhoodsLoading } =
    useNeighborhoodsByPostalCode(form.postalCode);

  const mergePatch = (patch: Record<string, string>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const canSave =
    form.street.trim().length > 0 &&
    form.neighborhoodFullCode !== "-1" &&
    form.postalCode.trim().length === 5;

  const handleClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSave = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      const created = await createAddress({
        neighborhoodFullCode: form.neighborhoodFullCode,
        street: form.street,
        externalNumber: form.externalNumber || undefined,
        internalNumber: form.internalNumber || undefined,
        postalCode: form.postalCode,
      });
      const neighborhoodName =
        neighborhoods.find((n) => n.full_code === form.neighborhoodFullCode)?.name ?? "";
      const formatted = [
        formatStreetAddressLine({
          street: form.street,
          externalNumber: form.externalNumber,
          internalNumber: form.internalNumber,
        }),
        neighborhoodName,
        form.city,
        form.state,
      ]
        .filter((part) => part && part.trim().length > 0)
        .join(", ");

      onSaved({ id: created.id, formatted });
      setForm(EMPTY_FORM);
    } catch {
      snackbar.showError("No se pudo guardar la dirección, intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Nueva dirección de entrega
          </Typography>

          <Grid container spacing={2}>
            <PostalCodeSettlementFields
              postalCode={form.postalCode}
              neighborhoodFullCode={form.neighborhoodFullCode}
              neighborhoods={neighborhoods}
              neighborhoodsLoading={neighborhoodsLoading}
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

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={handleClose} sx={{ textTransform: "none" }}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={!canSave || saving}
              onClick={handleSave}
              sx={{ textTransform: "none" }}
            >
              {saving ? "Guardando..." : "Guardar dirección"}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
