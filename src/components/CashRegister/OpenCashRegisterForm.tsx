import { Button, InputAdornment, Typography, CircularProgress } from "@mui/material";
import { FormTextField } from "@/components/Form";
import { formatDate } from "@/utils/date";
import {
  Card,
  FormFieldsContainer,
} from "@/styles/cajas.styles";

import type { OpenCashRegisterFormProps } from "./types";

export function OpenCashRegisterForm({
  initialFund,
  exchangeRate,
  canOpen = true,
  isLoading = false,
  onInitialFundChange,
  onExchangeRateChange,
  onOpen,
}: OpenCashRegisterFormProps) {
  return (
    <Card>
      <Typography variant="body1" fontWeight={500} textAlign="center">
        {formatDate(new Date(), "dateLong")}
      </Typography>

      <FormFieldsContainer>
        <FormTextField
          label="Fondo inicial"
          placeholder="0"
          value={initialFund}
          onChange={(e) => {
            const inputValue = e.target.value;
            if (inputValue === "" || /^\d*$/.test(inputValue)) {
              onInitialFundChange(inputValue);
            }
          }}
          type="text"
          inputMode="numeric"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">$</InputAdornment>
            ),
          }}
        />

        <FormTextField
          label="Paridad cambiaria"
          placeholder="0.00"
          value={exchangeRate}
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
        disabled={!canOpen || isLoading}
        fullWidth>
        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Abrir caja"}
      </Button>
    </Card>
  );
}
