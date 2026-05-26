import { Button, InputAdornment, Typography } from "@mui/material";
import { FormTextField } from "@/components/Form";
import {
  Card,
  FormFieldsContainer,
} from "@/styles/cajas.styles";

import type { OpenCashRegisterFormProps } from "./types";

export function OpenCashRegisterForm({
  initialFund,
  exchangeRate,
  canOpen = true,
  onInitialFundChange,
  onExchangeRateChange,
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
    <Card>
      <Typography variant="body1" fontWeight={500} textAlign="center">{formatDate()}</Typography>

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

      <Button
        variant="contained"
        onClick={onOpen}
        disabled={!canOpen}
        fullWidth>
        Abrir caja
      </Button>
    </Card>
  );
}
