import { Button, Checkbox, FormControlLabel, InputAdornment } from "@mui/material";
import { FormTextField } from "@/components/Form";
import {
  OpenCashRegisterCard,
  DateDisplay,
  FormFieldsContainer,
} from "@/styles/cajas.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

import type { OpenCashRegisterFormProps } from "./types";

// ============================================================================
// COMPONENT
// ============================================================================

export function OpenCashRegisterForm({
  initialFund,
  exchangeRate,
  rememberDevice,
  onInitialFundChange,
  onExchangeRateChange,
  onRememberDeviceChange,
  onOpen,
}: OpenCashRegisterFormProps) {
  const formatDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("es-MX", options);
  };

  return (
    <OpenCashRegisterCard>
      <DateDisplay>{formatDate()}</DateDisplay>

      <FormFieldsContainer>
        <FormTextField
          label="Fondo inicial"
          placeholder="0.00"
          value={initialFund.toFixed(2)}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
              onInitialFundChange(inputValue);
            }
          }}
          type="text"
          inputMode="decimal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">$</InputAdornment>
            ),
          }}
        />

        <FormTextField
          label="Paridad cambiaria"
          placeholder="0.00"
          value={exchangeRate.toFixed(2)}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
              onExchangeRateChange(inputValue);
            }
          }}
          type="text"
          inputMode="decimal"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">$</InputAdornment>
            ),
          }}
        />
      </FormFieldsContainer>

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberDevice}
            onChange={(e) => onRememberDeviceChange(e.target.checked)}
            size="small"
          />
        }
        label="Recordar caja abierta en este equipo"
        sx={{
          "& .MuiFormControlLabel-label": {
            fontSize: "0.875rem",
          },
        }}
      />

      <Button variant="contained" onClick={onOpen} fullWidth>
        Abrir caja
      </Button>
    </OpenCashRegisterCard>
  );
}
