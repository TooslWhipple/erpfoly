"use client";

import type { SyntheticEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  InputAdornment,
  useTheme,
  type AutocompleteInputChangeReason,
} from "@mui/material";
import type { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { FormTextField } from "@/components/Form/FormTextField";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { unwrapOrThrow } from "@/lib/axios";
import {
  searchAccountingAccounts,
  type AccountingAccountItem,
} from "@/services/accounting-accounts.service";

const SEARCH_DEBOUNCE_MS = 300;

export interface AccountingAccountSearchFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

interface AccountingAccountOption {
  code: string;
  label: string;
}

function itemToOption(item: AccountingAccountItem): AccountingAccountOption {
  return {
    code: item.code,
    label: item.label || `${item.code} - ${item.name}`,
  };
}

export function AccountingAccountSearchField({
  label = "Cuenta contable",
  placeholder = "Buscar cuenta por código o nombre...",
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: AccountingAccountSearchFieldProps) {
  const theme = useTheme();

  const [inputValue, setInputValue] = useState(value);
  const [committedSelection, setCommittedSelection] = useState<AccountingAccountOption | null>(
    value ? { code: value, label: value } : null,
  );

  const searchTerm = inputValue.trim() || value.trim();
  const debouncedQ = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["accounting-account-search", debouncedQ],
    queryFn: async () => {
      const result = await searchAccountingAccounts({
        q: debouncedQ,
        limit: 20,
      });
      return unwrapOrThrow(result).map(itemToOption);
    },
    enabled: Boolean(debouncedQ && debouncedQ.length >= 1),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!value) {
      if (committedSelection != null) {
        setCommittedSelection(null);
      }
      return;
    }

    const matchedOption = options.find((opt) => opt.code === value);
    if (matchedOption) {
      setCommittedSelection(matchedOption);
      setInputValue(matchedOption.label);
      return;
    }

    if (!committedSelection || committedSelection.code !== value) {
      setCommittedSelection({ code: value, label: value });
      setInputValue((prev) => (prev === "" ? value : prev));
    }
  }, [value, options]);

  const handleInputChange = useCallback(
    (_event: SyntheticEvent, newInputValue: string, reason: AutocompleteInputChangeReason) => {
      if (reason === "clear") {
        setInputValue("");
        setCommittedSelection(null);
        onChange("");
        onBlur?.();
        return;
      }
      if (reason === "reset") {
        return;
      }
      setInputValue(newInputValue);
      if (committedSelection != null && newInputValue !== committedSelection.label) {
        setCommittedSelection(null);
        onChange("");
      }
    },
    [committedSelection, onChange, onBlur],
  );

  const handleChange = useCallback(
    (_event: SyntheticEvent, newValue: AccountingAccountOption | null) => {
      if (newValue == null) {
        setCommittedSelection(null);
        setInputValue("");
        onChange("");
      } else {
        setCommittedSelection(newValue);
        setInputValue(newValue.label);
        onChange(newValue.code);
      }
      onBlur?.();
    },
    [onChange, onBlur],
  );

  const endAdornment = (
    <>
      {isFetching ? <CircularProgress color="inherit" size={18} sx={{ mr: 0.5 }} /> : null}
      <InputAdornment position="end">
        <Search size={18} color={theme.palette.text.secondary} />
      </InputAdornment>
    </>
  );

  return (
    <Autocomplete<AccountingAccountOption, false, false, false>
      fullWidth
      disabled={disabled}
      options={options}
      loading={isFetching}
      filterOptions={(list) => list}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) => a.code === b.code}
      value={committedSelection}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      noOptionsText={
        debouncedQ.length < 1
          ? "Escribe para buscar una cuenta..."
          : isFetching
            ? "Cargando resultados..."
            : "No se encontraron cuentas"
      }
      renderInput={(params: AutocompleteRenderInputParams) => {
        const { InputProps, ...rest } = params;
        return (
          <FormTextField
            {...rest}
            label={label}
            placeholder={placeholder}
            required={required}
            error={error}
            helperText={helperText}
            InputProps={{
              ...InputProps,
              endAdornment: (
                <>
                  {InputProps.endAdornment}
                  {endAdornment}
                </>
              ),
            }}
          />
        );
      }}
    />
  );
}
