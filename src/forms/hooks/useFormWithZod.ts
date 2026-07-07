import { useForm } from "@tanstack/react-form";
import type { z } from "zod";
import { zodFormValidator } from "../validation/zodValidator";

export type UseFormWithZodOptions<
    TSchema extends z.ZodTypeAny,
    TSubmitMeta = never,
> = {
    schema: TSchema;
    defaultValues: z.input<TSchema>;
    onSubmit: (props: { value: z.output<TSchema> }) => void | Promise<void>;
    onSubmitInvalid?: (props: { value: z.input<TSchema>; formApi: unknown }) => void;
    validateOn?: "change" | "blur" | "submit";
    submitMeta?: TSubmitMeta;
};

export function useFormWithZod<
    TSchema extends z.ZodTypeAny,
    TSubmitMeta = never,
>(options: UseFormWithZodOptions<TSchema, TSubmitMeta>) {
    const {
        schema,
        defaultValues,
        onSubmit,
        onSubmitInvalid,
        validateOn = "blur",
        submitMeta,
    } = options;

    const validator = zodFormValidator(schema);

    return useForm({
        defaultValues,
        validators: {
            onChange: validateOn === "change" ? validator : undefined,
            onBlur: validateOn === "blur" ? validator : undefined,
            onSubmit: validator,
        },
        onSubmit: async ({ value, formApi }) => {
            const parsed = schema.safeParse(value);
            if (parsed.success) {
                await onSubmit({ value: parsed.data });
            } else if (onSubmitInvalid) {
                onSubmitInvalid({ value, formApi });
            }
        },
        ...(submitMeta !== undefined && { onSubmitMeta: submitMeta }),
    });
}
