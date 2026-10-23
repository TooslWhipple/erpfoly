import { useState } from "react";
import { InputAdornment, Box } from "@mui/material";
import numeral from "numeral";
import { FormTextField, type FormTextFieldProps } from "./FormTextField";
import {
  parseCreditDownPayment,
  sanitizeCreditDownPaymentInput,
} from "@/utils/number";

type MoneyInputProps = Omit<
  FormTextFieldProps,
  "value" | "onChange" | "type" | "defaultValue"
> & {
  value: number | null;
  onChange: (value: number | null) => void;
};

function toRaw(value: number | null): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "";
  return value.toFixed(2);
}

function toCurrency(value: number | null): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "";
  return numeral(value).format("$0,0.00");
}

export function MoneyInput({
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder = "0.00",
  inputProps,
  InputProps,
  ...props
}: MoneyInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const text = focused && draft != null ? draft : toCurrency(value);

  return (
    <FormTextField
      {...props}
      type="text"
      value={text}
      placeholder={placeholder}
      inputProps={{ inputMode: "decimal", ...inputProps }}
      InputProps={{
        ...InputProps,
        startAdornment: focused ? (
          <InputAdornment position="start">
            <Box component="span" sx={{ color: "text.secondary" }}>
              $
            </Box>
          </InputAdornment>
        ) : (
          InputProps?.startAdornment
        ),
      }}
      onFocus={(event) => {
        setFocused(true);
        setDraft(toRaw(value));
        onFocus?.(event);
      }}
      onBlur={(event) => {
        const parsed = parseCreditDownPayment(
          sanitizeCreditDownPaymentInput(draft ?? text),
        );
        onChange(parsed);
        setDraft(null);
        setFocused(false);
        onBlur?.(event);
      }}
      onChange={(event) => {
        const raw = sanitizeCreditDownPaymentInput(event.target.value);
        setDraft(raw);
        onChange(parseCreditDownPayment(raw));
      }}
    />
  );
}
