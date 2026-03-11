"use client";

import {
    FormControl,
    FormControlLabel,
    FormHelperText,
    Checkbox,
    Switch,
} from "@mui/material";
import { FormTextField } from "@/components/Form/FormTextField";
import { FormSelect } from "@/components/Form/FormSelect";
import { MultiSelectAutocomplete } from "@/components/MultiSelectAutocomplete";
import type { SelectOption, AutocompleteItem, FormFieldInputType } from "../types";

export function FormFieldRender<TName extends string>({
    field,
    label,
    type = "text",
    placeholder,
    options = [],
    items = [],
    rows,
    helperText,
    filter,
    slotProps,
    disabled = false,
    required,
    showErrorOnlyAfterSubmit,
}: {
    field: {
        name: TName;
        state: {
            value: unknown;
            meta: { errors: unknown[]; isTouched: boolean; isValid: boolean };
        };
        handleChange: (value: unknown) => void;
        handleBlur: () => void;
    };
    label?: string;
    type?: FormFieldInputType;
    placeholder?: string;
    options?: SelectOption[];
    items?: AutocompleteItem[];
    rows?: number;
    helperText?: string;
    filter?: (value: string) => string;
    slotProps?: Record<string, unknown>;
    disabled?: boolean;
    required?: boolean;
    showErrorOnlyAfterSubmit?: boolean;
}) {
    const value = field.state.value;
    const errors = field.state.meta.errors;
    const hasError = !field.state.meta.isValid;
    const errorMessage = Array.isArray(errors)
        ? (errors as string[]).join(", ")
        : errors != null
          ? String(errors)
          : undefined;
    const showError = showErrorOnlyAfterSubmit
        ? field.state.meta.isTouched && hasError
        : hasError;
    const finalHelperText = showError ? errorMessage : helperText;

    const common = {
        disabled,
        error: showError,
        helperText: finalHelperText,
        required,
    };

    switch (type) {
        case "select":
            return (
                <FormSelect
                    {...common}
                    label={label}
                    placeholder={placeholder}
                    value={value ?? ""}
                    options={options}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                />
            );
        case "checkbox":
            return (
                <FormControl error={showError}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={Boolean(value)}
                                onChange={(e) => field.handleChange(e.target.checked)}
                                disabled={disabled}
                            />
                        }
                        label={label}
                    />
                    {finalHelperText && (
                        <FormHelperText>{finalHelperText}</FormHelperText>
                    )}
                </FormControl>
            );
        case "switch":
            return (
                <FormControl error={showError}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={Boolean(value)}
                                onChange={(e) => field.handleChange(e.target.checked)}
                                disabled={disabled}
                                color="primary"
                            />
                        }
                        label={label}
                    />
                    {finalHelperText && (
                        <FormHelperText>{finalHelperText}</FormHelperText>
                    )}
                </FormControl>
            );
        case "textarea":
            return (
                <FormTextField
                    {...common}
                    id={field.name}
                    label={label}
                    placeholder={placeholder}
                    value={value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    multiline
                    rows={rows ?? 4}
                />
            );
        case "number":
            return (
                <FormTextField
                    {...common}
                    id={field.name}
                    label={label}
                    placeholder={placeholder}
                    value={value ?? ""}
                    onChange={(e) => {
                        const v = e.target.value;
                        if (v === "" || /^-?\d*\.?\d*$/.test(v))
                            field.handleChange(v);
                    }}
                    onBlur={field.handleBlur}
                    type="text"
                    inputMode="decimal"
                />
            );
        case "date":
            return (
                <FormTextField
                    {...common}
                    id={field.name}
                    label={label}
                    placeholder={placeholder}
                    value={value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    type="date"
                />
            );
        case "datetime":
            return (
                <FormTextField
                    {...common}
                    id={field.name}
                    label={label}
                    placeholder={placeholder}
                    value={value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    type="datetime-local"
                />
            );
        case "autocomplete":
            return (
                <MultiSelectAutocomplete
                    label={label}
                    placeholder={placeholder ?? "Seleccione"}
                    items={items}
                    selectedIds={Array.isArray(value) ? value : []}
                    onChange={(ids) => field.handleChange(ids)}
                    disabled={disabled}
                    error={showError}
                    helperText={finalHelperText}
                    emptyText="No hay opciones"
                    emptyChipsText="No hay selección"
                />
            );
        case "text":
        default:
            return (
                <FormTextField
                    {...common}
                    id={field.name}
                    label={label}
                    placeholder={placeholder}
                    value={value ?? ""}
                    onChange={(e) =>
                        field.handleChange(
                            filter ? filter(e.target.value) : e.target.value,
                        )
                    }
                    onBlur={field.handleBlur}
                    type="text"
                    slotProps={slotProps}
                />
            );
    }
}

interface FormFieldComponentProps<TName extends string> {
    form: {
        Field: React.ComponentType<{
            name: TName;
            children: (field: unknown) => React.ReactNode;
        }>;
    };
    name: TName;
    label?: string;
    type?: FormFieldInputType;
    placeholder?: string;
    options?: SelectOption[];
    items?: AutocompleteItem[];
    rows?: number;
    helperText?: string;
    filter?: (value: string) => string;
    slotProps?: Record<string, unknown>;
    disabled?: boolean;
    required?: boolean;
    showErrorOnlyAfterSubmit?: boolean;
}

/**
 * Renders form.Field + FormFieldRender for a single field.
 * Used by useFormFromFields; can be used directly for custom layouts.
 */
export function FormField<TName extends string>({
    form,
    name,
    ...rest
}: FormFieldComponentProps<TName>) {
    const Field = form.Field as React.ComponentType<{
        name: TName;
        children: (field: {
            name: TName;
            state: {
                value: unknown;
                meta: {
                    errors: unknown[];
                    isTouched: boolean;
                    isValid: boolean;
                };
            };
            handleChange: (value: unknown) => void;
            handleBlur: () => void;
        }) => React.ReactNode;
    }>;
    return (
        <Field name={name}>
            {(field) => <FormFieldRender field={field} {...rest} />}
        </Field>
    );
}
