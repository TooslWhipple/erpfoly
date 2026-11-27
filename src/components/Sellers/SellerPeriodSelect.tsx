import { MenuItem, TextField } from "@mui/material";
import type { SellerPeriodOption } from "@/utils/sellerPeriods";

export interface SellerPeriodSelectProps {
  options: SellerPeriodOption[];
  /** `YYYY-MM` of the selected option. */
  value: string;
  onChange: (option: SellerPeriodOption) => void;
  disabled?: boolean;
}

export function SellerPeriodSelect({
  options,
  value,
  onChange,
  disabled = false,
}: SellerPeriodSelectProps) {
  return (
    <TextField
      select
      size="small"
      label="Periodo"
      value={value}
      disabled={disabled}
      onChange={(event) => {
        const option = options.find((o) => o.value === event.target.value);
        if (option) onChange(option);
      }}
      sx={{ minWidth: { xs: "100%", sm: 220 } }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
