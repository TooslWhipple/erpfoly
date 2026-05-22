import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  CircularProgress,
  TextField,
  type AutocompleteInputChangeReason,
} from "@mui/material";
import type { MunicipalityShippingCatalogItem } from "@/types/shipping-costs.types";
import { useShippingMunicipalityCatalog } from "@/hooks/useShippingMunicipalityCatalog";

type MunicipalityOption = {
  id: number;
  label: string;
  municipalityName: string;
  stateName: string;
};

interface ShippingMunicipalityAutocompleteProps {
  value: number | null;
  configuredMunicipalities: MunicipalityShippingCatalogItem[];
  disabled?: boolean;
  onChange: (municipalityId: number | null) => void;
}

export function ShippingMunicipalityAutocomplete({
  value,
  configuredMunicipalities,
  disabled = false,
  onChange,
}: ShippingMunicipalityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [stickySelectedOption, setStickySelectedOption] = useState<MunicipalityOption | null>(
    null
  );
  const [inputValue, setInputValue] = useState("");
  const {
    preloadMunicipalities,
    searchedMunicipalities,
    isFetching,
    debouncedSearch,
  } = useShippingMunicipalityCatalog({
    searchInput,
    open,
  });

  const options = useMemo<MunicipalityOption[]>(() => {
    const byId = new Map<number, MunicipalityOption>();
    for (const item of configuredMunicipalities) {
      byId.set(item.municipalityId, {
        id: item.municipalityId,
        label: `${item.municipalityName} (${item.stateName})`,
        municipalityName: item.municipalityName,
        stateName: item.stateName,
      });
    }
    const dynamicMunicipalities =
      debouncedSearch.length >= 2 ? searchedMunicipalities : preloadMunicipalities;

    for (const item of dynamicMunicipalities) {
      byId.set(item.id, {
        id: item.id,
        label: `${item.name} (${item.stateName})`,
        municipalityName: item.name,
        stateName: item.stateName,
      });
    }
    return [...byId.values()].sort((a, b) => a.municipalityName.localeCompare(b.municipalityName));
  }, [configuredMunicipalities, debouncedSearch.length, preloadMunicipalities, searchedMunicipalities]);

  const selectedOption = useMemo(() => {
    if (value == null) return null;
    return (
      options.find((option) => option.id === value) ??
      (stickySelectedOption?.id === value ? stickySelectedOption : null)
    );
  }, [options, stickySelectedOption, value]);

  const clearSelection = useCallback(
    (notifyParent: boolean) => {
      setStickySelectedOption(null);
      setInputValue("");
      setSearchInput("");
      if (notifyParent) {
        onChange(null);
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (value == null) {
      setStickySelectedOption(null);
    }
  }, [value]);

  useEffect(() => {
    if (selectedOption != null) {
      setInputValue(selectedOption.label);
      return;
    }
    if (value == null) {
      setInputValue("");
    }
  }, [selectedOption, value]);

  return (
    <Autocomplete<MunicipalityOption, false, false, false>
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      disabled={disabled}
      options={options}
      value={selectedOption}
      inputValue={inputValue}
      loading={isFetching}
      loadingText="Cargando ciudades..."
      filterOptions={(list) => list}
      noOptionsText="Sin resultados"
      clearOnBlur={false}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      onInputChange={(_, inputValue: string, reason: AutocompleteInputChangeReason) => {
        if (reason === "input") {
          if (selectedOption != null) {
            return;
          }
          setInputValue(inputValue);
          setSearchInput(inputValue);
          return;
        }
        if (reason === "clear") {
          clearSelection(false);
          return;
        }
        if (reason === "reset") {
          setInputValue(inputValue);
          setSearchInput("");
        }
      }}
      onChange={(_, option) => {
        if (option == null) {
          clearSelection(true);
          return;
        }
        if (option != null) {
          setStickySelectedOption(option);
        }
        setInputValue(option?.label ?? "");
        setSearchInput("");
        onChange(option?.id ?? null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Ciudad"
          placeholder="Buscar municipio..."
          size="small"
          onKeyDown={(event) => {
            if (event.key !== "Backspace") return;
            if (selectedOption == null) return;
            event.preventDefault();
            clearSelection(true);
          }}
          InputProps={{
            ...params.InputProps,
            readOnly: selectedOption != null,
            endAdornment: (
              <>
                {isFetching ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
