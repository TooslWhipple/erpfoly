import { forwardRef, useMemo } from "react";
import {
  Autocomplete,
  type AutocompleteRenderInputParams,
  Typography,
} from "@mui/material";
import {
  FieldLabel,
  FieldWrapper,
  StyledTextField,
} from "./FormTextField.styles";
import type { SelectOption } from "./FormSelect";

export interface FormAutocompleteProps {
  label?: string;
  options: SelectOption[];
  value?: string | number | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  noOptionsText?: string;
}

export const FormAutocomplete = forwardRef<HTMLDivElement, FormAutocompleteProps>(
  (
    {
      label,
      options,
      value = "",
      onChange,
      onBlur,
      placeholder = "Seleccione",
      required,
      error,
      helperText,
      disabled,
      noOptionsText = "Sin resultados",
    },
    ref,
  ) => {
    const hasError = Boolean(error);

    const selectedOption = useMemo(() => {
      if (value === "" || value == null) return null;
      return options.find((option) => String(option.value) === String(value)) ?? null;
    }, [options, value]);

    return (
      <FieldWrapper ref={ref}>
        {label && (
          <FieldLabel sx={{ display: "flex", alignItems: "center" }}>
            {label}
            {required && (
              <Typography component="span" sx={{ color: "error.main", ml: 0.5 }}>
                *
              </Typography>
            )}
          </FieldLabel>
        )}
        <Autocomplete<SelectOption, false, false, false>
          fullWidth
          size="small"
          disabled={disabled}
          options={options}
          value={selectedOption}
          onChange={(_, option) => {
            onChange(option ? String(option.value) : "");
          }}
          onBlur={onBlur}
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, current) =>
            String(option.value) === String(current.value)
          }
          noOptionsText={noOptionsText}
          renderInput={(params: AutocompleteRenderInputParams) => (
            <StyledTextField
              {...params}
              placeholder={placeholder}
              error={hasError}
              helperText={helperText}
            />
          )}
        />
      </FieldWrapper>
    );
  },
);

FormAutocomplete.displayName = "FormAutocomplete";
