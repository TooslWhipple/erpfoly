"use client";

import type { SxProps, Theme } from "@mui/material";
import { useFormFromFields } from "../hooks";
import type {
    FormFieldDefinition,
    SchemaOutputFromFields,
    SchemaInputFromFields,
} from "../fields";
import type { z } from "zod";
import { FormSubmitActions } from "./FormSubmitActions";

type FieldDef = FormFieldDefinition<string, z.ZodTypeAny>;

export interface FormFromFieldsProps<T extends readonly FieldDef[]> {
    /** Same as ModalFormZod: single source of truth per field */
    fields: T;
    defaultValues: SchemaInputFromFields<T>;
    onSubmit: (value: SchemaOutputFromFields<T>) => void | Promise<void>;
    confirmLabel?: string;
    loading?: boolean;
    validateOn?: "change" | "blur" | "submit";
    /** MUI sx prop for the actions container (alignment, spacing, etc.). */
    actionsSx?: SxProps<Theme>;
    children?: React.ReactNode;
}

/**
 * Same form as ModalFormZod (fields + schema + submit) but without the modal.
 * Use in panels, cards, or any inline layout. One component, same API.
 */
export function FormFromFields<T extends readonly FieldDef[]>({
    fields,
    defaultValues,
    onSubmit,
    confirmLabel = "Guardar",
    loading = false,
    validateOn = "blur",
    actionsSx,
    children,
}: FormFromFieldsProps<T>) {
    const { form, FormContent } = useFormFromFields(fields, defaultValues, onSubmit, {
        validateOn,
    });

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
            }}
        >
            <FormContent disabled={loading} asForm={false}>
                {children}
            </FormContent>
            <FormSubmitActions
                form={form}
                submitLabel={confirmLabel}
                loading={loading}
                sx={actionsSx}
            />
        </form>
    );
}
