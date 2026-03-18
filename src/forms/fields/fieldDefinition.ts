import { z } from "zod";
import type { FormFieldInputType, SelectOption, AutocompleteItem } from "../types";

/**
 * Single source of truth for a form field: schema (validation) + UI config.
 * Use with buildSchema(), ModalFormZod and FormFromFields so you define each field once.
 * For type "autocomplete" provide `items` (list of options).
 */
export interface FormFieldDefinition<
    TName extends string = string,
    TSchema extends z.ZodTypeAny = z.ZodTypeAny,
> {
    name: TName;
    schema: TSchema;
    label: string;
    type?: FormFieldInputType;
    placeholder?: string;
    options?: SelectOption[];
    /** Required when type is "autocomplete" (multi-select with search) */
    items?: AutocompleteItem[];
    rows?: number;
    helperText?: string;
    /** Transform value on each keystroke (e.g. filters.onlyNumbers(10) for phone). Only applies to text-like inputs. */
    filter?: (value: string) => string;
    /** MUI TextField slotProps (e.g. { input: { startAdornment: <InputAdornment>$</InputAdornment> } }). */
    slotProps?: Record<string, unknown>;
    /** Renders the field only when current form values match (e.g. show extra fields when a switch is on). */
    visibleWhen?: { field: string; equals: unknown };
}

/**
 * Helper to define form fields with type inference and autocomplete.
 * Pass the form shape so `name` is constrained to valid keys.
 *
 * @example
 * const fields = defineFormFields<{ name: string; email: string }>()([
 *   { name: "name", schema: z.string().min(1), label: "Nombre", type: "text" },
 *   { name: "email", schema: z.email(), label: "Email", type: "text" },
 * ] as const);
 */
export function defineFormFields<TShape extends Record<string, unknown>>() {
    return function <T extends readonly FormFieldDefinition<Extract<keyof TShape, string>>[]>(
        fields: T,
    ): T {
        return fields;
    };
}

type FieldDefWithSchema = FormFieldDefinition<string, z.ZodTypeAny>;

export function buildSchema<T extends readonly FieldDefWithSchema[]>(
    fields: T,
): z.ZodObject<z.ZodRawShape> {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        shape[field.name] = field.schema;
    }
    return z.object(shape) as z.ZodObject<z.ZodRawShape>;
}

export type SchemaOutputFromFields<T extends readonly FieldDefWithSchema[]> = {
    [K in T[number]["name"]]: z.output<Extract<T[number], { name: K }>["schema"]>;
};

export type SchemaInputFromFields<T extends readonly FieldDefWithSchema[]> = {
    [K in T[number]["name"]]: z.input<Extract<T[number], { name: K }>["schema"]>;
};
