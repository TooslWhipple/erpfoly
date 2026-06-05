import { forwardRef, useMemo } from "react";
import { Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import type { Dayjs } from "dayjs";
import { Calendar } from "@/components/Icons";
import dayjs from "@/lib/dayjs";
import { FieldLabel, FieldWrapper, StyledTextField } from "./FormTextField.styles";
import { StyledOpenPickerButton } from "./FormDatePicker.styles";

export interface FormDatePickerProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  openTo?: "year" | "month" | "day";
  views?: ("year" | "month" | "day")[];
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  fullWidth?: boolean;
}

function OpenPickerIcon() {
  return <Calendar size={16} />;
}

export const FormDatePicker = forwardRef<HTMLDivElement, FormDatePickerProps>(
  (
    {
      label,
      required,
      value,
      onChange,
      openTo,
      views,
      error,
      helperText,
      disabled,
      placeholder = "Selecciona",
      minDate,
      maxDate,
      fullWidth = true,
    },
    ref,
  ) => {
    const parsedValue = useMemo(() => {
      if (!value) {
        return null;
      }

      const parsed = dayjs(value, "YYYY-MM-DD", true);
      return parsed.isValid() ? parsed : null;
    }, [value]);

    const handleChange = (newValue: Dayjs | null) => {
      if (!newValue || !newValue.isValid()) {
        onChange("");
        return;
      }

      onChange(newValue.format("YYYY-MM-DD"));
    };

    return (
      <FieldWrapper ref={ref}>
        {label && (
          <FieldLabel>
            {label}
            {required && (
              <Typography component="span" sx={{ color: "error.main", ml: 0.5 }}>
                *
              </Typography>
            )}
          </FieldLabel>
        )}
        <DatePicker
          value={parsedValue}
          onChange={handleChange}
          disabled={disabled}
          format="DD/MM/YYYY"
          openTo={openTo}
          views={views}
          minDate={minDate ? dayjs(minDate, "YYYY-MM-DD", true) : undefined}
          maxDate={maxDate ? dayjs(maxDate, "YYYY-MM-DD", true) : undefined}
          slots={{
            textField: StyledTextField,
            openPickerIcon: OpenPickerIcon,
            openPickerButton: StyledOpenPickerButton,
          }}
          slotProps={{
            textField: {
              fullWidth,
              error,
              helperText,
              placeholder,
            },
          }}
        />
      </FieldWrapper>
    );
  },
);

FormDatePicker.displayName = "FormDatePicker";
