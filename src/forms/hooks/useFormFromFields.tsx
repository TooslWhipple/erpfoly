"use client";

import { useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import type { z } from "zod";
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

export interface UseFormFromFieldsOptions {
    validateOn?: "change" | "blur" | "submit";
}

export interface UseFormFromFieldsResult<T extends readonly FieldDef[]> {
    form: ReturnType<typeof useFormWithZod<z.ZodObject<z.ZodRawShape>>>;
    FormContent: (props: {
        children?: React.ReactNode;
        disabled?: boolean;
        /** When false, render as Box (caller wraps in own form). Default true for modal usage. */
        asForm?: boolean;
    }) => React.ReactElement;
}

/**
 * Builds a form from a fields array: schema + TanStack Form + form body component.
 * Use with ModalFormZod (form + FormContent in modal) or FormFromFields (form + FormContent in page).
 */
export function useFormFromFields<T extends readonly FieldDef[]>(
    fields: T,
    defaultValues: SchemaInputFromFields<T>,
    onSubmit: (value: SchemaOutputFromFields<T>) => void | Promise<void>,
    options?: UseFormFromFieldsOptions,
): UseFormFromFieldsResult<T> {
    const schema = useMemo(() => buildSchema(fields), [fields]);

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
        }: { children?: React.ReactNode; disabled?: boolean; asForm?: boolean }) {
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
                    <FormBody>
                        {fields.map((fieldConfig) => (
                            <FormField
                                key={String(fieldConfig.name)}
                                form={form}
                                name={
                                    fieldConfig.name as keyof SchemaOutputFromFields<T> & string
                                }
                                label={fieldConfig.label}
                                type={fieldConfig.type ?? "text"}
                                placeholder={fieldConfig.placeholder}
                                options={fieldConfig.options}
                                items={fieldConfig.items}
                                rows={fieldConfig.rows}
                                helperText={fieldConfig.helperText}
                                filter={fieldConfig.filter}
                                slotProps={fieldConfig.slotProps}
                                disabled={disabled}
                            />
                        ))}
                    </FormBody>
                    {contentChildren}
                </Box>
            );
        },
        [form, fields],
    );

    return { form, FormContent };
}
