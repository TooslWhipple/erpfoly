import { useMemo } from "react";
import { Stack } from "@mui/material";
import { z } from "zod";
import { ModalFormZod } from "@/components/ModalFormZod";
import { FormField } from "@/forms";
import { defineFormFields } from "@/forms";
import { messages } from "@/forms/validation/messages";
import type { SelectOption } from "@/components/RuleCard";

export type AutomatedCollectionRuleFormValues = {
  name: string;
  conditionTypeId: string;
  comparisonOperatorId: string;
  timePeriodId: string;
  messageId: string;
  status: boolean;
};

export interface AutomatedCollectionRuleFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AutomatedCollectionRuleFormValues) => Promise<void>;
  loading?: boolean;
  triggerOptions: SelectOption[];
  operatorOptions: SelectOption[];
  periodOptions: SelectOption[];
  messageOptions: SelectOption[];
}

export function AutomatedCollectionRuleFormModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  triggerOptions,
  operatorOptions,
  periodOptions,
  messageOptions,
}: AutomatedCollectionRuleFormModalProps) {
  const fields = useMemo(
    () =>
      defineFormFields<AutomatedCollectionRuleFormValues>()([
        {
          name: "name",
          schema: z
            .string()
            .trim()
            .min(1, { message: messages.required })
            .max(128, { message: messages.string.max(128) }),
          label: "Nombre de la regla",
          type: "text",
          placeholder: "Ej. Recordatorio 1 día antes",
        },
        {
          name: "conditionTypeId",
          schema: z.string().min(1, { message: messages.required }),
          label: "Si",
          type: "select",
          placeholder: "Selecciona condición",
          options: triggerOptions,
        },
        {
          name: "comparisonOperatorId",
          schema: z.string().min(1, { message: messages.required }),
          label: "es",
          type: "select",
          placeholder: "Selecciona operador",
          options: operatorOptions,
        },
        {
          name: "timePeriodId",
          schema: z.string().min(1, { message: messages.required }),
          label: "a",
          type: "select",
          placeholder: "Selecciona periodo",
          options: periodOptions,
        },
        {
          name: "messageId",
          schema: z.string().min(1, { message: messages.required }),
          label: "enviar",
          type: "select",
          placeholder: "Selecciona mensaje",
          options: messageOptions,
        },
        {
          name: "status",
          schema: z.boolean(),
          label: "Activa",
          type: "switch",
        },
      ] as const),
    [triggerOptions, operatorOptions, periodOptions, messageOptions],
  );

  const defaultValues: AutomatedCollectionRuleFormValues = useMemo(
    () => ({
      name: "",
      conditionTypeId: triggerOptions[0]?.value ?? "",
      comparisonOperatorId: operatorOptions[0]?.value ?? "",
      timePeriodId: periodOptions[0]?.value ?? "",
      messageId: messageOptions[0]?.value ?? "",
      status: false,
    }),
    [triggerOptions, operatorOptions, periodOptions, messageOptions],
  );

  return (
    <ModalFormZod
      key={open ? "open" : "closed"}
      open={open}
      onClose={onClose}
      title="Nueva regla de cobranza"
      description="Configura la condición y el mensaje que se enviará automáticamente."
      fields={fields}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      loading={loading}
      confirmLabel="Crear"
      maxWidth="sm"
      fullWidth
      validateOn="change"
      customFieldLayout
    >
      {({ form }) => (
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <FormField
            form={form}
            name="name"
            label="Nombre de la regla"
            placeholder="Ej. Recordatorio 1 día antes"
            required
          />
          <FormField
            form={form}
            name="conditionTypeId"
            label="Si"
            type="select"
            options={triggerOptions}
            required
          />
          <FormField
            form={form}
            name="comparisonOperatorId"
            label="es"
            type="select"
            options={operatorOptions}
            required
          />
          <FormField
            form={form}
            name="timePeriodId"
            label="a"
            type="select"
            options={periodOptions}
            required
          />
          <FormField
            form={form}
            name="messageId"
            label="enviar"
            type="select"
            options={messageOptions}
            required
          />
          <FormField form={form} name="status" label="Activa" type="switch" />
        </Stack>
      )}
    </ModalFormZod>
  );
}
