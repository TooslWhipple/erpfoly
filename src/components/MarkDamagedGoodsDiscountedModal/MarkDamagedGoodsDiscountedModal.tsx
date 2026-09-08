import { useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import { FormTextField } from "@/components/Form";
import { ChargeSummaryFooter } from "@/styles/catalogos/proveedores-charges.styles";

const VAT_RATE = 0.16;

export interface MarkDamagedGoodsDiscountedFormValues {
  amount: number;
  vatIncluded: boolean;
}

export interface MarkDamagedGoodsDiscountedModalProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  productCode: string;
  saving?: boolean;
  onSubmit: (values: MarkDamagedGoodsDiscountedFormValues) => Promise<boolean>;
}

function calculateChargeTotals(amount: number, vatIncluded: boolean) {
  if (amount <= 0) {
    return { vat: 0, total: 0 };
  }

  if (vatIncluded) {
    const subtotal = amount / (1 + VAT_RATE);
    const vat = amount - subtotal;
    return { vat, total: amount };
  }

  const vat = amount * VAT_RATE;
  return { vat, total: amount + vat };
}

function parseAmountInput(value: string): number {
  const normalized = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MarkDamagedGoodsDiscountedModal({
  open,
  onClose,
  productName,
  productCode,
  saving = false,
  onSubmit,
}: MarkDamagedGoodsDiscountedModalProps) {
  const [amountInput, setAmountInput] = useState("");
  const [vatIncluded, setVatIncluded] = useState(true);
  const [amountError, setAmountError] = useState<string | undefined>();

  const resetForm = () => {
    setAmountInput("");
    setVatIncluded(true);
    setAmountError(undefined);
  };

  const amountNumber = useMemo(() => parseAmountInput(amountInput), [amountInput]);

  const { vat, total } = useMemo(
    () => calculateChargeTotals(amountNumber, vatIncluded),
    [amountNumber, vatIncluded]
  );

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    if (nextValue === "" || /^\d*\.?\d{0,2}$/.test(nextValue)) {
      setAmountInput(nextValue);
    }
  };

  const handleAmountBlur = () => {
    if (!amountInput.trim()) return;
    const parsed = parseAmountInput(amountInput);
    setAmountInput(parsed > 0 ? parsed.toFixed(2) : "");
  };

  const handleSubmit = async () => {
    if (amountNumber <= 0) {
      setAmountError("Ingresa un monto válido.");
      return;
    }
    setAmountError(undefined);
    const success = await onSubmit({ amount: amountNumber, vatIncluded });
    if (success) {
      resetForm();
    }
  };

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      disableClose={saving}
      maxWidth="sm"
      title="Marcar como descontado"
      description="Registra el monto que se cargará al proveedor por esta mercancía dañada."
      headerActions={
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : "Marcar como descontado"}
        </Button>
      }
    >
      <Stack spacing={2.5}>
        <FormTextField
          label="Producto"
          value={`${productName} (${productCode})`}
          disabled
          InputProps={{ readOnly: true }}
        />

        <Stack spacing={0.5}>
          <Typography variant="body1" fontWeight={500}>
            Monto
          </Typography>
          <Grid container spacing={2} alignItems="center" justifyContent="flex-end">
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                placeholder="0.00"
                value={amountInput}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                error={Boolean(amountError)}
                helperText={amountError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography fontWeight={600}>$</Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack direction="row" alignItems="center" alignSelf="flex-end" spacing={1} flex={1}>
                <Switch
                  checked={vatIncluded}
                  onChange={(event) => setVatIncluded(event.target.checked)}
                  color="primary"
                />
                <Typography variant="body1">¿Monto incluye IVA?</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Stack>

        <ChargeSummaryFooter>
          <Typography variant="body2" color="text.secondary">
            IVA: {numeral(vat).format("$0,0.00")}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            Total: {numeral(total).format("$0,0.00")}
          </Typography>
        </ChargeSummaryFooter>
      </Stack>
    </SideModal>
  );
}
