"use client";

import type { ReactNode, SyntheticEvent } from "react";
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
    PRODUCT_SEARCH_DEFAULT_LIMIT,
    searchProducts,
    type ProductSearchItem,
} from "@/services/damaged-products.service";

const SEARCH_DEBOUNCE_MS = 300;

type FormApi = {
    Field: import("react").ComponentType<{
        name: "productId";
        children: (field: {
            state: { value: unknown; meta: { errors: unknown[]; isValid: boolean } };
            handleChange: (value: unknown) => void;
            handleBlur: () => void;
        }) => ReactNode;
    }>;
};

export interface DamagedGoodsProductSearchFieldProps {
    form: FormApi;
    /** When false, search requests are not executed (e.g. modal closed or another tab active). */
    fetchEnabled: boolean;
    disabled?: boolean;
}

export function DamagedGoodsProductSearchField({
    form,
    fetchEnabled,
    disabled = false,
}: DamagedGoodsProductSearchFieldProps) {
    return (
        <form.Field name="productId">
            {(field) => (
                <DamagedGoodsProductSearchFieldInner
                    field={field}
                    disabled={disabled}
                    queryEnabled={fetchEnabled}
                />
            )}
        </form.Field>
    );
}

interface InnerProps {
    field: {
        state: { value: unknown; meta: { errors: unknown[]; isValid: boolean } };
        handleChange: (value: unknown) => void;
        handleBlur: () => void;
    };
    disabled: boolean;
    queryEnabled: boolean;
}

function DamagedGoodsProductSearchFieldInner({
    field,
    disabled,
    queryEnabled,
}: InnerProps) {
    const theme = useTheme();
    const productId = typeof field.state.value === "number" ? field.state.value : 0;

    const [inputValue, setInputValue] = useState("");
    const [committedSelection, setCommittedSelection] = useState<ProductSearchItem | null>(null);

    const debouncedQ = useDebouncedValue(inputValue.trim(), SEARCH_DEBOUNCE_MS);

    const { data: options = [], isFetching } = useQuery({
        queryKey: ["products-search", debouncedQ, PRODUCT_SEARCH_DEFAULT_LIMIT],
        queryFn: async () =>
            unwrapOrThrow(
                await searchProducts({
                    q: debouncedQ,
                    limit: PRODUCT_SEARCH_DEFAULT_LIMIT,
                }),
            ),
        staleTime: 30_000,
        enabled: queryEnabled,
    });

    useEffect(() => {
        if (productId === 0) {
            setCommittedSelection(null);
            setInputValue("");
        }
    }, [productId]);

    const handleInputChange = useCallback(
        (_: SyntheticEvent, value: string, reason: AutocompleteInputChangeReason) => {
            if (reason === "clear") {
                setInputValue("");
                setCommittedSelection(null);
                field.handleChange(0);
                field.handleBlur();
                return;
            }
            if (reason === "reset") {
                return;
            }
            setInputValue(value);
            if (committedSelection != null && value !== committedSelection.shortName) {
                setCommittedSelection(null);
                field.handleChange(0);
            }
        },
        [committedSelection, field],
    );

    const errors = field.state.meta.errors;
    const errorMessage = Array.isArray(errors)
        ? errors.map((e) => (typeof e === "string" ? e : String(e))).join(", ")
        : undefined;
    const showError = !field.state.meta.isValid && Boolean(errorMessage);

    const endAdornment = (
        <>
            {isFetching ? <CircularProgress color="inherit" size={18} sx={{ mr: 0.5 }} /> : null}
            <InputAdornment position="end">
                <Search size={18} color={theme.palette.text.secondary} />
            </InputAdornment>
        </>
    );

    return (
        <Autocomplete<ProductSearchItem, false, false, false>
            fullWidth
            disabled={disabled}
            options={options}
            loading={isFetching}
            filterOptions={(list) => list}
            getOptionLabel={(option) => option.shortName}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            value={committedSelection}
            inputValue={inputValue}
            onInputChange={handleInputChange}
            onChange={(_, newValue) => {
                if (newValue == null) {
                    setCommittedSelection(null);
                    setInputValue("");
                    field.handleChange(0);
                } else {
                    setCommittedSelection(newValue);
                    setInputValue(newValue.shortName);
                    field.handleChange(newValue.id);
                }
                field.handleBlur();
            }}
            noOptionsText="Sin resultados"
            renderInput={(params: AutocompleteRenderInputParams) => {
                const { InputProps, ...rest } = params;
                return (
                    <FormTextField
                        {...rest}
                        label="Artículo"
                        placeholder="Buscar"
                        required
                        error={showError}
                        helperText={showError ? errorMessage : undefined}
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
