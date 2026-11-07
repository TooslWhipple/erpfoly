import { useState } from "react";
import { Button, InputAdornment, OutlinedInput, Stack, Typography } from "@mui/material";
import { saleInputSx } from "./styles";

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

/** Agrupa miles de un monto en texto ("1234.5" -> "1,234.5") para mostrarlo sin foco. */
function groupAmountText(text: string): string {
  const [whole, fraction] = text.split(".");
  const grouped = Number(whole || "0").toLocaleString("es-MX");
  return fraction != null ? `${grouped}.${fraction}` : grouped;
}

export type DownPaymentFieldProps = {
  /** Texto crudo del monto (sin agrupar miles). */
  valueText: string;
  onChange: (text: string) => void;
  /** Se dispara al perder el foco; el padre normaliza el texto. */
  onCommit: () => void;
  onUseMinimum: () => void;
  minimum: number;
  /** Porcentaje mínimo para la leyenda, ej. "10%". */
  minimumPercentLabel: string;
  /** Porcentaje que representa el enganche elegido, ej. "91%", o null. */
  sharePercentLabel: string | null;
  errorText: string | null;
  atMinimum: boolean;
  ariaLabel: string;
  /** Solo lectura: sin edición ni "Usar mínimo" (cajero ve lo acordado). */
  readOnly?: boolean;
};

/** Campo "Enganche" compartido por crédito y apartado. */
export function DownPaymentField({
  valueText,
  onChange,
  onCommit,
  onUseMinimum,
  minimum,
  minimumPercentLabel,
  sharePercentLabel,
  errorText,
  atMinimum,
  ariaLabel,
  readOnly = false,
}: DownPaymentFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Typography variant="body2" color="text.secondary">
          Enganche
        </Typography>
        <OutlinedInput
          size="small"
          readOnly={readOnly}
          value={focused ? valueText : groupAmountText(valueText)}
          onFocus={() => setFocused(true)}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => {
            setFocused(false);
            onCommit();
          }}
          error={errorText != null}
          inputProps={{
            inputMode: "decimal",
            autoComplete: "off",
            "aria-label": ariaLabel,
            style: { textAlign: "right" },
          }}
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          sx={{ width: 168, flexShrink: 0, ...saleInputSx }}
        />
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
      >
        <Typography
          variant="caption"
          color={errorText ? "error" : "text.secondary"}
        >
          {errorText ??
            `Mínimo ${currencyFormatter.format(minimum)} (${minimumPercentLabel})${sharePercentLabel ? ` · ${sharePercentLabel}` : ""}`}
        </Typography>
        {!readOnly && !atMinimum && (
          <Button
            size="small"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onUseMinimum}
            sx={{ minWidth: 0, px: 0.5, py: 0, textTransform: "none" }}
          >
            Usar mínimo
          </Button>
        )}
      </Stack>
    </>
  );
}
