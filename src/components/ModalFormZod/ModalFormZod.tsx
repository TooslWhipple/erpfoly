"use client";

import { useEffect, useRef } from "react";
import { Button, CircularProgress } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import { useFormFromFields } from "@/forms";
import type { FormFieldDefinition, SchemaOutputFromFields, SchemaInputFromFields } from "@/forms";
import { styled } from "@mui/material/styles";

const SubmitButton = styled(Button)(({ theme }) => ({
    minWidth: 120,
    borderRadius: theme.shape.borderRadius,
}));

type FieldDef = FormFieldDefinition<string, import("zod").ZodTypeAny>;

export interface ModalFormZodProps<T extends readonly FieldDef[]> {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    fields: T;
    defaultValues: SchemaInputFromFields<T>;
    onSubmit: (value: SchemaOutputFromFields<T>) => void | Promise<void>;
    confirmLabel?: string;
    loading?: boolean;
    maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
    fullWidth?: boolean;
    validateOn?: "change" | "blur" | "submit";
    children?:
    | React.ReactNode
    | ((values: Record<string, unknown>) => React.ReactNode);
    headerContent?: React.ReactNode;
}

export function ModalFormZod<T extends readonly FieldDef[]>({
    open,
    onClose,
    title,
    description,
    fields,
    defaultValues,
    onSubmit,
    confirmLabel = "Guardar",
    loading = false,
    maxWidth = "md",
    fullWidth = true,
    validateOn = "blur",
    children,
    headerContent,
}: ModalFormZodProps<T>) {
    const { form, FormContent } = useFormFromFields(fields, defaultValues, onSubmit, {
        validateOn,
    });

    const prevOpenRef = useRef(false);
    useEffect(() => {
        if (open && !prevOpenRef.current) {
            form.reset(defaultValues);
        }
        prevOpenRef.current = open;
        // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when open becomes true
    }, [open]);

    return (
        <SideModal
            open={open}
            onClose={onClose}
            title={title}
            description={description}
            headerContent={headerContent}
            headerActions={
                <form.Subscribe
                    selector={(state: { canSubmit: boolean; isSubmitting: boolean }) => [
                        state.canSubmit,
                        state.isSubmitting,
                    ]}
                >
                    {([canSubmit, isSubmitting]) => (
                        <SubmitButton
                            type="button"
                            variant="contained"
                            color="primary"
                            disabled={loading || !canSubmit || isSubmitting}
                            onClick={() => form.handleSubmit()}
                        >
                            {loading || isSubmitting ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : (
                                confirmLabel
                            )}
                        </SubmitButton>
                    )}
                </form.Subscribe>
            }
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            disableClose={loading}
        >
            <FormContent disabled={loading}>
                {
                    typeof children === "function" ? (
                        <form.Subscribe
                            selector={(state: { values: Record<string, unknown> }) =>
                                state.values
                            }
                        >
                            {(values: Record<string, unknown>) =>
                                (children as (v: Record<string, unknown>) => React.ReactNode)(
                                    values,
                                )
                            }
                        </form.Subscribe>
                    ) : (
                        children
                    )
                }
            </FormContent>
        </SideModal>
    );
}
