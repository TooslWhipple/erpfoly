"use client";

import { useEffect, useRef } from "react";
import { CircularProgress } from "@mui/material";
import type { z } from "zod";
import { SideModal } from "@/components/SideModal";
import { useFormFromFields } from "@/forms";
import type { FormFieldDefinition, SchemaOutputFromFields, SchemaInputFromFields } from "@/forms";
import { SubmitButton } from "./ModalFormZod.styles";

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
  children?: React.ReactNode;
  headerContent?: React.ReactNode;
  /** Emitted when any field value changes while the modal is open (for dependent UI such as conditional sections). */
  onValuesChange?: (values: Record<string, unknown>) => void;
  schemaSuperRefine?: (data: SchemaOutputFromFields<T>, ctx: z.RefinementCtx) => void;
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
  onValuesChange,
  schemaSuperRefine,
}: ModalFormZodProps<T>) {
  const { form, FormContent } = useFormFromFields(fields, defaultValues, onSubmit, {
    validateOn,
    schemaSuperRefine,
  });

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      form.reset(defaultValues);
    }
    prevOpenRef.current = open;
    // Reset sync on open transition only; defaultValues alignment relies on `key` remounting when switching entities.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting on every defaultValues render
  }, [open]);

  useEffect(() => {
    if (!open || !onValuesChange) {
      return undefined;
    }
    const subscription = form.store.subscribe(() => {
      onValuesChange(form.store.state.values as Record<string, unknown>);
    });
    onValuesChange(form.store.state.values as Record<string, unknown>);
    return () => {
      subscription.unsubscribe();
    };
  }, [open, form, onValuesChange]);

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
      <FormContent disabled={loading}>{children}</FormContent>
    </SideModal>
  );
}
