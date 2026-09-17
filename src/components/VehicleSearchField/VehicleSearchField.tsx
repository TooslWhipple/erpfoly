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
import { getVehicles, type Vehicle } from "@/services/vehicles.service";
import { formatVehicleLabel } from "@/utils/rutas-api.mapper";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 1;

interface VehicleOption {
  id: number;
  label: string;
}

function vehicleToOption(vehicle: Vehicle): VehicleOption {
  return {
    id: vehicle.id,
    label: formatVehicleLabel(vehicle.brand, vehicle.model, vehicle.plate),
  };
}

export interface VehicleSearchFieldProps {
  label?: string;
  placeholder?: string;
  value: number | null;
  selectedLabel?: string | null;
  onChange: (vehicleId: number | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export function VehicleSearchField({
  label = "Vehículo asignado",
  placeholder,
  value,
  selectedLabel,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: VehicleSearchFieldProps) {
  const theme = useTheme();

  const [inputValue, setInputValue] = useState(selectedLabel ?? "");
  const [committedSelection, setCommittedSelection] =
    useState<VehicleOption | null>(
      value != null
        ? {
            id: value,
            label: selectedLabel ?? String(value),
          }
        : null,
    );

  const searchTerm = inputValue.trim();
  const debouncedQ = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);

  const { data: options = [], isFetching } = useQuery({
    queryKey: ["vehicle-search", debouncedQ],
    queryFn: async () => {
      const result = await getVehicles({
        page: 1,
        limit: 20,
        search: debouncedQ || undefined,
        status: "ACTIVE",
      });
      return unwrapOrThrow(result).rows.map(vehicleToOption);
    },
    staleTime: 30_000,
    enabled: debouncedQ.length >= MIN_QUERY_LENGTH || value != null,
  });

  useEffect(() => {
    if (value == null) {
      if (committedSelection !== null) {
        setCommittedSelection(null);
        setInputValue("");
      }
      return;
    }

    if (committedSelection?.id === value) {
      const matching = options.find((option) => option.id === value);
      if (matching && matching.label !== committedSelection.label) {
        setCommittedSelection(matching);
        setInputValue(matching.label);
      }
      return;
    }

    const matching = options.find((option) => option.id === value);
    if (matching) {
      setCommittedSelection(matching);
      setInputValue(matching.label);
      return;
    }

    const fallbackLabel = selectedLabel ?? String(value);
    setCommittedSelection({ id: value, label: fallbackLabel });
    setInputValue((prev) => (prev === "" ? fallbackLabel : prev));
  }, [value, selectedLabel, options, committedSelection]);

  const handleInputChange = useCallback(
    (
      _: SyntheticEvent,
      newInputValue: string,
      reason: AutocompleteInputChangeReason,
    ) => {
      if (reason === "clear") {
        setInputValue("");
        setCommittedSelection(null);
        onChange(null);
        onBlur?.();
        return;
      }
      if (reason === "reset") {
        return;
      }
      setInputValue(newInputValue);
      if (
        committedSelection != null &&
        newInputValue !== committedSelection.label
      ) {
        setCommittedSelection(null);
      }
    },
    [committedSelection, onChange, onBlur],
  );

  const endAdornment = (
    <>
      {isFetching ? (
        <CircularProgress color="inherit" size={18} sx={{ mr: 0.5 }} />
      ) : null}
      <InputAdornment position="end">
        <Search size={18} color={theme.palette.text.secondary} />
      </InputAdornment>
    </>
  );

  return (
    <Autocomplete<VehicleOption, false, false, false>
      fullWidth
      disabled={disabled}
      options={options}
      loading={isFetching}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      value={committedSelection}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      clearOnBlur={false}
      onChange={(_, newValue) => {
        if (newValue == null) {
          setCommittedSelection(null);
          setInputValue("");
          onChange(null);
        } else {
          setCommittedSelection(newValue);
          setInputValue(newValue.label);
          onChange(newValue.id);
        }
        onBlur?.();
      }}
      noOptionsText="Sin resultados"
      renderInput={(params: AutocompleteRenderInputParams) => {
        const { InputProps, ...rest } = params;
        return (
          <FormTextField
            {...rest}
            label={label}
            placeholder={placeholder ?? "Buscar vehículo"}
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
