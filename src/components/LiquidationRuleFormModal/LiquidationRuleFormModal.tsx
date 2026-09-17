import { useMemo } from "react";
import { Stack } from "@mui/material";
import { z } from "zod";
import { ModalFormZod } from "@/components/ModalFormZod";
import { FormField } from "@/forms";
import { defineFormFields } from "@/forms";
import { messages } from "@/forms/validation/messages";
import type {
  LiquidationRuleOperator,
  LiquidationRulePeriod,
} from "@/types/liquidaciones.types";

export type LiquidationRuleFormValues = {
  operator: LiquidationRuleOperator;
  value: number;
  periodDays: LiquidationRulePeriod;
  promotionPercent: number;
  redLabelEnabled: boolean;
};

export interface LiquidationRuleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LiquidationRuleFormValues) => Promise<void>;
  loading?: boolean;
}

const OPERATOR_OPTIONS = [
  { value: "less", label: "Menor" },
  { value: "greater", label: "Mayor" },
];

const PERIOD_OPTIONS = [
  { value: "30", label: "30 días" },
  { value: "60", label: "60 días" },
  { value: "90", label: "90 días" },
];

export function LiquidationRuleFormModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: LiquidationRuleFormModalProps) {
  const fields = useMemo(
    () =>
      defineFormFields<LiquidationRuleFormValues>()([
        {
          name: "operator",
          schema: z
            .string()
            .min(1, { message: messages.required })
            .refine(
              (value): value is LiquidationRuleOperator =>
                value === "less" || value === "greater",
              { message: messages.required },
            ),
          label: "Si el número de ventas es",
          type: "select",
          placeholder: "Selecciona",
          options: OPERATOR_OPTIONS,
        },
        {
          name: "value",
          schema: z
            .string()
            .trim()
            .min(1, { message: messages.required })
            .transform((value) => Number(value))
            .pipe(
              z
                .number({ message: messages.required })
                .int({ message: "Debe ser un número entero" })
                .min(0, { message: messages.number.min(0) })
                .max(999, { message: messages.number.max(999) }),
            ),
          label: "Umbral de ventas",
          type: "number",
          placeholder: "Ej. 3",
        },
        {
          name: "periodDays",
          schema: z
            .string()
            .min(1, { message: messages.required })
            .refine(
              (value): value is LiquidationRulePeriod =>
                value === "30" || value === "60" || value === "90",
              { message: messages.required },
            ),
          label: "en un periodo de",
          type: "select",
          placeholder: "Selecciona",
          options: PERIOD_OPTIONS,
        },
        {
          name: "promotionPercent",
          schema: z
            .string()
            .trim()
            .min(1, { message: messages.required })
            .transform((value) => Number(value))
            .pipe(
              z
                .number({ message: messages.required })
                .min(0, { message: messages.number.min(0) })
                .max(100, { message: messages.number.max(100) }),
            ),
          label: "Promoción a aplicar (%)",
          type: "number",
          placeholder: "Ej. 10",
        },
        {
          name: "redLabelEnabled",
          schema: z.boolean(),
          label: "Imprimir con etiqueta roja",
          type: "switch",
        },
      ] as const),
    [],
  );

  const defaultValues = useMemo(
    () => ({
      operator: "",
      value: "",
      periodDays: "",
      promotionPercent: "",
      redLabelEnabled: false,
    }),
    [],
  );

  return (
    <ModalFormZod
      key={open ? "open" : "closed"}
      open={open}
      onClose={onClose}
      title="Nueva regla de liquidación"
      description="Define cuándo un producto de lento movimiento entra en promoción y si se imprime con etiqueta roja."
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      loading={loading}
      confirmLabel="Agregar"
      maxWidth="sm"
      fullWidth
      validateOn="change"
      customFieldLayout
    >
      {({ form }) => (
        <Stack spacing={2.5} sx={{ pt: 1, width: "100%", minWidth: 0 }}>
          <FormField
            form={form}
            name="operator"
            label="Si el número de ventas es"
            type="select"
            options={OPERATOR_OPTIONS}
            placeholder="Selecciona"
            required
          />
          <FormField
            form={form}
            name="value"
            label="Umbral de ventas"
            type="number"
            placeholder="Ej. 3"
            required
          />
          <FormField
            form={form}
            name="periodDays"
            label="en un periodo de"
            type="select"
            options={PERIOD_OPTIONS}
            placeholder="Selecciona"
            required
          />
          <FormField
            form={form}
            name="promotionPercent"
            label="Promoción a aplicar (%)"
            type="number"
            placeholder="Ej. 10"
            required
          />
          <FormField
            form={form}
            name="redLabelEnabled"
            label="Imprimir con etiqueta roja"
            type="switch"
          />
        </Stack>
      )}
    </ModalFormZod>
  );
}
