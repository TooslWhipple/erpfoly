import { useState, useCallback, useMemo } from "react";
import {
    Box,
    Grid,
    FormControl,
    FormHelperText,
    Checkbox,
    Switch,
    FormControlLabel,
    CircularProgress,
} from "@mui/material";
import {
    FormContainer,
    FormHeader,
    FormTitle,
    FormDescription,
    FormContent,
    FormActions,
    CancelButton,
    ConfirmButton,
} from "./styles";
import { FormTextField } from "./FormTextField";
import { FormSelect } from "./FormSelect";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type FieldType =
    | "text"
    | "number"
    | "date"
    | "datetime"
    | "select"
    | "checkbox"
    | "switch"
    | "textarea"
    | "email"
    | "password"
    | "phone"
    | "currency";

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface FieldValidation {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    custom?: (value: unknown, allValues: Record<string, unknown>) => string | undefined;
}

export interface FormFieldConfig {
    /** Unique field identifier */
    name: string;
    /** Display label */
    label: string;
    /** Field input type */
    type: FieldType;
    /** Placeholder text */
    placeholder?: string;
    /** Default value */
    defaultValue?: unknown;
    /** Options for select type */
    options?: SelectOption[];
    /** Validation rules */
    validation?: FieldValidation;
    /** Disable field */
    disabled?: boolean;
    /** Helper text below field */
    helperText?: string;
    /** Grid breakpoints for responsive layout */
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    /** Number of rows for textarea */
    rows?: number;
    /** Currency symbol for currency type */
    currencySymbol?: string;
    /** Auto focus this field */
    autoFocus?: boolean;
    /** Transform value on change (e.g. toUpperCase for code fields) */
    transformInput?: (value: string) => string;
    /** Show validation error only after form submit, not on blur */
    showErrorOnlyAfterSubmit?: boolean;
}

export interface FormProps {
    /** Form title */
    title?: string;
    /** Form description */
    description?: string;
    /** Field configurations */
    fields: FormFieldConfig[];
    /** Cancel button callback */
    onCancel?: () => void;
    /** Confirm/submit callback */
    onConfirm: (data: Record<string, unknown>) => void | Promise<void>;
    /** Confirm button label */
    confirmLabel?: string;
    /** Cancel button label */
    cancelLabel?: string;
    /** Loading state */
    loading?: boolean;
    /** Initial values for fields */
    initialValues?: Record<string, unknown>;
    /** Default grid spacing */
    spacing?: number;
    /** Show header section */
    showHeader?: boolean;
    /** Show footer actions */
    showActions?: boolean;
    /** Callback fired when form values change */
    onValuesChange?: (values: Record<string, unknown>) => void;
}

type FormErrors = Record<string, string>;
type FormValues = Record<string, unknown>;
type TouchedFields = Record<string, boolean>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateField(
    field: FormFieldConfig,
    value: unknown,
    allValues: FormValues
): string | undefined {
    const { validation, label } = field;
    if (!validation) return undefined;

    const stringValue = value !== undefined && value !== null ? String(value) : "";
    const numericValue = Number(value);

    // Required validation
    if (validation.required) {
        if (value === undefined || value === null || stringValue.trim() === "") {
            return `${label} es requerido`;
        }
        if ((field.type === "checkbox" || field.type === "switch") && value === false) {
            return `${label} es requerido`;
        }
    }

    // Skip other validations if empty and not required
    if (stringValue.trim() === "") return undefined;

    // Min/Max for numbers
    if (field.type === "number" || field.type === "currency") {
        if (validation.min !== undefined && numericValue < validation.min) {
            return `${label} debe ser al menos ${validation.min}`;
        }
        if (validation.max !== undefined && numericValue > validation.max) {
            return `${label} debe ser máximo ${validation.max}`;
        }
    }

    // Min/Max length for strings
    if (validation.minLength !== undefined && stringValue.length < validation.minLength) {
        return `${label} debe tener al menos ${validation.minLength} caracteres`;
    }
    if (validation.maxLength !== undefined && stringValue.length > validation.maxLength) {
        return `${label} debe tener máximo ${validation.maxLength} caracteres`;
    }

    // Pattern validation
    if (validation.pattern && !validation.pattern.test(stringValue)) {
        return validation.patternMessage || `${label} tiene un formato inválido`;
    }

    // Custom validation
    if (validation.custom) {
        return validation.custom(value, allValues);
    }

    return undefined;
}

function validateForm(fields: FormFieldConfig[], values: FormValues): FormErrors {
    const errors: FormErrors = {};

    for (const field of fields) {
        const error = validateField(field, values[field.name], values);
        if (error) {
            errors[field.name] = error;
        }
    }

    return errors;
}

// ============================================================================
// FORM COMPONENT
// ============================================================================

export function Form({
    title,
    description,
    fields,
    onCancel,
    onConfirm,
    confirmLabel = "Guardar",
    cancelLabel = "Cancelar",
  loading = false,
  initialValues = {},
  spacing = 2,
  showHeader = true,
  showActions = true,
  onValuesChange,
}: FormProps) {
    // Initialize form values with defaults
    const defaultValues = useMemo(() => {
        const values: FormValues = {};
        for (const field of fields) {
            if (initialValues[field.name] !== undefined) {
                values[field.name] = initialValues[field.name];
            } else if (field.defaultValue !== undefined) {
                values[field.name] = field.defaultValue;
            } else if (field.type === "checkbox" || field.type === "switch") {
                values[field.name] = false;
            } else if (field.type === "number" || field.type === "currency") {
                values[field.name] = "";
            } else {
                values[field.name] = "";
            }
        }
        return values;
    }, [fields, initialValues]);

    const [values, setValues] = useState<FormValues>(defaultValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<TouchedFields>({});
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Handle value change
    const handleChange = useCallback(
        (fieldName: string, newValue: unknown) => {
            const field = fields.find((f) => f.name === fieldName);
            if (field?.transformInput && typeof newValue === "string") {
                newValue = field.transformInput(newValue);
            }

            setValues((prev) => {
                const updated = { ...prev, [fieldName]: newValue };

                // Notify parent of value changes
                if (onValuesChange) {
                    onValuesChange(updated);
                }

                return updated;
            });

            // Clear error on change if field was touched
            if (touched[fieldName] && errors[fieldName]) {
                const fieldForError = fields.find((f) => f.name === fieldName);
                if (fieldForError) {
                    const newError = validateField(fieldForError, newValue, { ...values, [fieldName]: newValue });
                    setErrors((prev) => {
                        if (newError) {
                            return { ...prev, [fieldName]: newError };
                        }
                        const { [fieldName]: _, ...rest } = prev;
                        return rest;
                    });
                }
            }
        },
        [touched, errors, fields, values, onValuesChange]
    );

    // Handle field blur
    const handleBlur = useCallback(
        (fieldName: string) => {
            setTouched((prev) => ({ ...prev, [fieldName]: true }));

            const field = fields.find((f) => f.name === fieldName);
            if (field) {
                const error = validateField(field, values[fieldName], values);
                setErrors((prev) => {
                    if (error) {
                        return { ...prev, [fieldName]: error };
                    }
                    const { [fieldName]: _, ...rest } = prev;
                    return rest;
                });
            }
        },
        [fields, values]
    );

    // Handle form submit
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setHasSubmitted(true);

            // Validate all fields
            const validationErrors = validateForm(fields, values);
            setErrors(validationErrors);

            // Mark all fields as touched
            const allTouched: TouchedFields = {};
            for (const field of fields) {
                allTouched[field.name] = true;
            }
            setTouched(allTouched);

            // If there are errors, don't submit
            if (Object.keys(validationErrors).length > 0) {
                return;
            }

            // Call onConfirm
            await onConfirm(values);
        },
        [fields, values, onConfirm]
    );

    // Render individual field
    const renderField = (field: FormFieldConfig) => {
        const {
            name,
            label,
            type,
            placeholder,
            options,
            disabled,
            helperText,
            rows,
            autoFocus,
            validation,
        } = field;

        const value = values[name];
        const error = field.showErrorOnlyAfterSubmit
            ? (hasSubmitted ? errors[name] : undefined)
            : (touched[name] ? errors[name] : undefined);
        const hasError = Boolean(error);
        const isRequired = validation?.required ?? false;

        // Common props for text-based inputs
        const commonProps = {
            disabled: disabled || loading,
            error: hasError,
            helperText: error || helperText,
            onBlur: () => handleBlur(name),
            autoFocus,
            required: isRequired,
        };

        switch (type) {
            case "select":
                return (
                    <FormSelect
                        {...commonProps}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        options={options ?? []}
                        onChange={(e) => handleChange(name, e.target.value)}
                    />
                );

            case "checkbox":
                return (
                    <FormControl error={hasError}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={Boolean(value)}
                                    onChange={(e) => handleChange(name, e.target.checked)}
                                    disabled={disabled || loading}
                                />
                            }
                            label={label}
                        />
                        {(error || helperText) && (
                            <FormHelperText>{error || helperText}</FormHelperText>
                        )}
                    </FormControl>
                );

            case "switch":
                return (
                    <FormControl error={hasError}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={Boolean(value)}
                                    onChange={(e) => handleChange(name, e.target.checked)}
                                    disabled={disabled || loading}
                                    color="primary"
                                />
                            }
                            label={label}
                        />
                        {(error || helperText) && (
                            <FormHelperText>{error || helperText}</FormHelperText>
                        )}
                    </FormControl>
                );

            case "textarea":
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => handleChange(name, e.target.value)}
                        multiline
                        rows={rows || 4}
                    />
                );

            case "number":
            case "currency":
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => {
                            const inputValue = e.target.value;
                            // Allow empty string, numbers, and decimal
                            if (inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue)) {
                                handleChange(name, inputValue);
                            }
                        }}
                        type="text"
                        inputMode="decimal"
                        InputProps={
                            type === "currency"
                                ? {
                                    startAdornment: (
                                        <Box component="span" sx={{ mr: 0.5, color: "text.secondary" }}>
                                            {field.currencySymbol || "$"}
                                        </Box>
                                    ),
                                }
                                : undefined
                        }
                    />
                );

            case "date":
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => handleChange(name, e.target.value)}
                        type="date"
                    />
                );

            case "datetime":
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => handleChange(name, e.target.value)}
                        type="datetime-local"
                    />
                );

            case "email":
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => handleChange(name, e.target.value)}
                        type="email"
                    />
                );

            case "password":
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => handleChange(name, e.target.value)}
                        type="password"
                    />
                );

            case "phone":
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => handleChange(name, e.target.value)}
                        type="tel"
                    />
                );

            case "text":
            default:
                return (
                    <FormTextField
                        {...commonProps}
                        id={name}
                        label={label}
                        placeholder={placeholder}
                        value={value ?? ""}
                        onChange={(e) => handleChange(name, e.target.value)}
                        type="text"
                    />
                );
        }
    };

    const hasHeader = showHeader && (title || description);

    return (
        <FormContainer onSubmit={handleSubmit}>
            {hasHeader && (
                <FormHeader>
                    {title && <FormTitle>{title}</FormTitle>}
                    {description && <FormDescription>{description}</FormDescription>}
                </FormHeader>
            )}

            <FormContent>
                <Grid container spacing={spacing}>
                    {fields.map((field) => {
                        const sizeProps: Record<string, number> = { xs: field.xs ?? 12 };
                        if (field.sm !== undefined) sizeProps.sm = field.sm;
                        if (field.md !== undefined) sizeProps.md = field.md;
                        if (field.lg !== undefined) sizeProps.lg = field.lg;
                        if (field.xl !== undefined) sizeProps.xl = field.xl;

                        return (
                            <Grid key={field.name} size={sizeProps}>
                                {renderField(field)}
                            </Grid>
                        );
                    })}
                </Grid>
            </FormContent>

            {showActions && (
                <FormActions>
                    {onCancel && (
                        <CancelButton
                            type="button"
                            variant="outlined"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            {cancelLabel}
                        </CancelButton>
                    )}
                    <ConfirmButton
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            confirmLabel
                        )}
                    </ConfirmButton>
                </FormActions>
            )}
        </FormContainer>
    );
}
