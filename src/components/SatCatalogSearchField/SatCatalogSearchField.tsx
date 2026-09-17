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
    searchSatProductServiceKeys,
    searchSatUnitsOfMeasure,
    searchSatVehicleConfigs,
    searchSatPermitTypes,
    SAT_PRODUCT_SERVICE_KEY_SEARCH_DEFAULT_LIMIT,
    SAT_UNIT_OF_MEASURE_SEARCH_DEFAULT_LIMIT,
    SAT_VEHICLE_CONFIG_SEARCH_DEFAULT_LIMIT,
    SAT_PERMIT_TYPE_SEARCH_DEFAULT_LIMIT,
    type SatProductServiceKeyItem,
    type SatUnitOfMeasureItem,
    type SatCatalogKeyItem,
} from "@/services/sat-catalog.service";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 1;

type SatCatalogType =
    | "product-service-key"
    | "unit-of-measure"
    | "vehicle-config"
    | "permit-type";

export interface SatCatalogSearchFieldProps {
    type: SatCatalogType;
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    required?: boolean;
    error?: boolean;
    helperText?: string;
}

interface SatCatalogOption {
    key: string;
    label: string;
}

function productServiceKeyToOption(item: SatProductServiceKeyItem): SatCatalogOption {
    return {
        key: item.key,
        label: `${item.key} - ${item.description}`,
    };
}

function unitOfMeasureToOption(item: SatUnitOfMeasureItem): SatCatalogOption {
    const description = item.description ?? item.name ?? "";
    return {
        key: item.key,
        label: `${item.key} - ${description}`,
    };
}

function catalogKeyToOption(item: SatCatalogKeyItem): SatCatalogOption {
    return {
        key: item.key,
        label: `${item.key} - ${item.description}`,
    };
}

export function SatCatalogSearchField({
    type,
    label,
    placeholder,
    value,
    onChange,
    onBlur,
    disabled = false,
    required = false,
    error = false,
    helperText,
}: SatCatalogSearchFieldProps) {
    const theme = useTheme();

    const [inputValue, setInputValue] = useState(value);
    const [committedSelection, setCommittedSelection] = useState<SatCatalogOption | null>(
        value ? { key: value, label: value } : null,
    );

    const searchTerm = inputValue.trim() || value.trim();
    const debouncedQ = useDebouncedValue(searchTerm, SEARCH_DEBOUNCE_MS);
    const isSmallOfficialCatalog =
        type === "vehicle-config" || type === "permit-type";

    const { data: options = [], isFetching } = useQuery({
        queryKey: isSmallOfficialCatalog
            ? ["sat-catalog-search", type]
            : ["sat-catalog-search", type, debouncedQ],
        queryFn: async () => {
            if (type === "product-service-key") {
                const result = await searchSatProductServiceKeys({
                    q: debouncedQ,
                    limit: SAT_PRODUCT_SERVICE_KEY_SEARCH_DEFAULT_LIMIT,
                });
                return unwrapOrThrow(result).map(productServiceKeyToOption);
            }
            if (type === "unit-of-measure") {
                const result = await searchSatUnitsOfMeasure({
                    q: debouncedQ,
                    limit: SAT_UNIT_OF_MEASURE_SEARCH_DEFAULT_LIMIT,
                });
                return unwrapOrThrow(result).map(unitOfMeasureToOption);
            }
            if (type === "vehicle-config") {
                const result = await searchSatVehicleConfigs({
                    limit: SAT_VEHICLE_CONFIG_SEARCH_DEFAULT_LIMIT,
                });
                return unwrapOrThrow(result).map(catalogKeyToOption);
            }
            const result = await searchSatPermitTypes({
                limit: SAT_PERMIT_TYPE_SEARCH_DEFAULT_LIMIT,
            });
            return unwrapOrThrow(result).map(catalogKeyToOption);
        },
        staleTime: 30_000,
        enabled: isSmallOfficialCatalog || debouncedQ.length >= MIN_QUERY_LENGTH,
    });

    // Synchronize committedSelection & inputValue when `value` prop changes from parent
    useEffect(() => {
        if (!value) {
            if (committedSelection !== null) {
                setCommittedSelection(null);
                setInputValue("");
            }
            return;
        }

        if (committedSelection?.key === value) {
            const matching = options.find((o) => o.key === value);
            if (matching && matching.label !== committedSelection.label) {
                setCommittedSelection(matching);
                setInputValue(matching.label);
            }
            return;
        }

        const matching = options.find((o) => o.key === value);
        if (matching) {
            setCommittedSelection(matching);
            setInputValue(matching.label);
        } else {
            setCommittedSelection({ key: value, label: value });
            setInputValue((prev) => (prev === "" ? value : prev));
        }
    }, [value]);

    // Enhance initial fallback selection with full label once options arrive
    useEffect(() => {
        if (value && committedSelection && committedSelection.key === value && committedSelection.label === value) {
            const matching = options.find((o) => o.key === value);
            if (matching) {
                setCommittedSelection(matching);
                setInputValue(matching.label);
            }
        }
    }, [options, value, committedSelection]);

    const handleInputChange = useCallback(
        (_: SyntheticEvent, newInputValue: string, reason: AutocompleteInputChangeReason) => {
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

    const endAdornment = (
        <>
            {isFetching ? <CircularProgress color="inherit" size={18} sx={{ mr: 0.5 }} /> : null}
            <InputAdornment position="end">
                <Search size={18} color={theme.palette.text.secondary} />
            </InputAdornment>
        </>
    );

    return (
        <Autocomplete<SatCatalogOption, false, false, false>
            fullWidth
            disabled={disabled}
            options={options}
            loading={isFetching}
            filterOptions={isSmallOfficialCatalog ? undefined : (list) => list}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(a, b) => a.key === b.key}
            value={committedSelection}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            clearOnBlur={false}
            onChange={(_, newValue) => {
                if (newValue == null) {
                    setCommittedSelection(null);
                    setInputValue("");
                    onChange("");
                } else {
                    setCommittedSelection(newValue);
                    setInputValue(newValue.label);
                    onChange(newValue.key);
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
                        placeholder={placeholder ?? "Buscar"}
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
