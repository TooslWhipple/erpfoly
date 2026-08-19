"use client";

import { useEffect, useRef } from "react";
import { CircularProgress } from "@mui/material";
import type { z } from "zod";
import { SideModal } from "@/components/SideModal";
import { useFormFromFields } from "@/forms";
import type {
  FormFieldDefinition,
  SchemaOutputFromFields,
  SchemaInputFromFields,
  UseFormFromFieldsResult,
} from "@/forms";
import { SubmitButton } from "./ModalFormZod.styles";

type FieldDef = FormFieldDefinition<string, import("zod").ZodTypeAny>;

export type ModalFormZodRenderFn<T extends readonly FieldDef[]> = (ctx: {
  form: UseFormFromFieldsResult<T>["form"];
}) => React.ReactNode;

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
  /** When true, submit stays enabled even if the form is invalid (errors still show on submit / revalidation). */
  allowInvalidSubmit?: boolean;
  /** When true, fields are not auto-rendered; use a function child to render `FormField` / `form.Field` manually. */
  customFieldLayout?: boolean;
  /**
   * For callers whose `defaultValues` arrive asynchronously (fetched entity, catalog).
   * While the modal is open, any change of this token re-initializes the form with the
   * current `defaultValues` **without remounting**, so the dialog is never destroyed and
   * recreated mid-transition. Leave it undefined when defaults are available synchronously.
   */
  defaultValuesKey?: string | number;
  children?: React.ReactNode | ModalFormZodRenderFn<T>;
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
  allowInvalidSubmit = false,
  customFieldLayout = false,
  children,
  headerContent,
  onValuesChange,
  schemaSuperRefine,
  defaultValuesKey,
}: ModalFormZodProps<T>) {
  const { form, FormContent } = useFormFromFields(fields, defaultValues, onSubmit, {
    validateOn,
    schemaSuperRefine,
  });

  const prevOpenRef = useRef(false);
  const prevDefaultsKeyRef = useRef(defaultValuesKey);
  useEffect(() => {
    const justOpened = open && !prevOpenRef.current;
    const defaultsArrived = open && defaultValuesKey !== prevDefaultsKeyRef.current;
    if (justOpened || defaultsArrived) {
      form.reset(defaultValues);
    }
    prevOpenRef.current = open;
    prevDefaultsKeyRef.current = defaultValuesKey;
    // Reset sync on the open transition, plus on `defaultValuesKey` changes for callers that
    // declare one (async defaults). Callers that leave it undefined keep the previous behaviour:
    // defaultValues alignment relies on `key` remounting when switching entities.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid resetting on every defaultValues render
  }, [open, defaultValuesKey]);

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
          {
            ([canSubmit, isSubmitting]) => (
              <SubmitButton
                type="button"
                variant="contained"
                color="primary"
                disabled={loading || (!allowInvalidSubmit && !canSubmit) || isSubmitting}
                onClick={() => form.handleSubmit()}>
                {
                  loading || isSubmitting ?
                    <CircularProgress size={20} color="inherit" />
                    :
                    confirmLabel
                }
              </SubmitButton>
            )
          }
        </form.Subscribe>
      }
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableClose={loading}
    >
      <FormContent disabled={loading} skipFieldBody={customFieldLayout}>
        {typeof children === "function" ? children({ form }) : children}
      </FormContent>
    </SideModal>
  );
}
