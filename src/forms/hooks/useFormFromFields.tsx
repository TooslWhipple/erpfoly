"use client";

import { useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import type { z } from "zod";
import { useStore } from "@tanstack/react-form";
import { useFormWithZod } from "./useFormWithZod";
import { buildSchema } from "../fields";
import type {
    FormFieldDefinition,
    SchemaOutputFromFields,
    SchemaInputFromFields,
} from "../fields";
import { FormField } from "../components/FormField";
import { FormBody } from "./useFormFromFields.styles";

type FieldDef = FormFieldDefinition<string, z.ZodTypeAny>;

export interface UseFormFromFieldsOptions<
    T extends readonly FieldDef[] = readonly FieldDef[],
> {
    validateOn?: "change" | "blur" | "submit";
    /** Object-level checks (e.g. conditional required fields, cross-field date order). */
    schemaSuperRefine?: (data: SchemaOutputFromFields<T>, ctx: z.RefinementCtx) => void;
}

export interface UseFormFromFieldsResult<T extends readonly FieldDef[]> {
    form: ReturnType<typeof useFormWithZod<z.ZodTypeAny>>;
    FormContent: (props: {
        children?: React.ReactNode;
        disabled?: boolean;
        /** When false, render as Box (caller wraps in own form). Default true for modal usage. */
        asForm?: boolean;
        /** When true, only the built-in field list is omitted; children render fields manually (e.g. tabs). */
        skipFieldBody?: boolean;
    }) => React.ReactElement;
}

/**
 * Builds a form from a fields array: schema + TanStack Form + form body component.
 * Use with ModalFormZod (form + FormContent in modal) or FormFromFields (form + FormContent in page).
 */
function ConditionalFormField<T extends readonly FieldDef[]>({
    form,
    fieldConfig,
    formDisabled,
}: {
    form: ReturnType<typeof useFormWithZod<z.ZodTypeAny>>;
    fieldConfig: T[number];
    formDisabled: boolean;
}) {
    const values = useStore(
        form.store,
        (s) => s.values as Record<string, unknown>,
    );
    if (fieldConfig.when && !fieldConfig.when(values)) {
        return null;
    }
    return (
        <FormField
            form={form}
            name={fieldConfig.name as keyof SchemaOutputFromFields<T> & string}
            label={fieldConfig.label}
            type={fieldConfig.type ?? "text"}
            placeholder={fieldConfig.placeholder}
            options={fieldConfig.options}
            items={fieldConfig.items}
            rows={fieldConfig.rows}
            helperText={fieldConfig.helperText}
            filter={fieldConfig.filter}
            slotProps={fieldConfig.slotProps}
            disabled={formDisabled || Boolean(fieldConfig.disabled)}
        />
    );
}

export function useFormFromFields<T extends readonly FieldDef[]>(
    fields: T,
    defaultValues: SchemaInputFromFields<T>,
    onSubmit: (value: SchemaOutputFromFields<T>) => void | Promise<void>,
    options?: UseFormFromFieldsOptions<T>,
): UseFormFromFieldsResult<T> {
    const schema = useMemo(
        () => buildSchema(fields, options?.schemaSuperRefine),
        [fields, options?.schemaSuperRefine],
    );

    const form = useFormWithZod({
        schema,
        defaultValues,
        onSubmit: async ({ value }) => {
            await onSubmit(value as SchemaOutputFromFields<T>);
        },
        validateOn: options?.validateOn ?? "blur",
    });

    const FormContent = useCallback(
        function FormContent({
            children: contentChildren,
            disabled = false,
            asForm = true,
            skipFieldBody = false,
        }: {
            children?: React.ReactNode;
            disabled?: boolean;
            asForm?: boolean;
            skipFieldBody?: boolean;
        }) {
            const boxSx = {
                display: "flex" as const,
                flexDirection: "column" as const,
                flex: 1,
                minHeight: 0,
                overflow: "auto" as const,
            };
            return (
                <Box
                    component={asForm ? "form" : "div"}
                    onSubmit={
                        asForm
                            ? (e: React.FormEvent) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  form.handleSubmit();
                              }
                            : undefined
                    }
                    sx={boxSx}
                >
                    {!skipFieldBody && (
                        <FormBody>
                            {fields.map((fieldConfig) => (
                                <ConditionalFormField<T>
                                    key={String(fieldConfig.name)}
                                    form={form}
                                    fieldConfig={fieldConfig}
                                    formDisabled={disabled}
                                />
                            ))}
                        </FormBody>
                    )}
                    {contentChildren}
                </Box>
            );
        },
        [form, fields],
    );

    return { form, FormContent };
}
