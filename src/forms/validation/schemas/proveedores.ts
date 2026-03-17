import { z } from "zod";
import { schemas } from "./common";

export const generalSchema = z.object({
    name: schemas.requiredString(1, "El nombre es requerido"),
    businessName: schemas.requiredString(1, "La razón social es requerida"),
    rfc: z
        .string()
        .min(1, "El RFC es requerido")
        .min(12, "El RFC debe tener entre 12 y 13 caracteres")
        .max(13, "El RFC debe tener entre 12 y 13 caracteres"),
    website: z
        .string()
        .optional()
        .refine(
            (v) => !v || v.startsWith("http://") || v.startsWith("https://"),
            "La URL debe comenzar con http:// o https://",
        ),
    email: z.preprocess(
        (v) => (v === "" ? undefined : v),
        z.string().email("El email tiene un formato inválido").optional(),
    ),
    paymentTerm: z
        .string()
        .min(1, "El plazo de pagos es requerido")
        .refine((v) => Number(v) > 0, "El plazo de pagos debe ser mayor a 0"),
});

export type GeneralSchemaInput = z.input<typeof generalSchema>;

export function validateGeneralForm(values: GeneralSchemaInput): {
    success: boolean;
    errors: Record<string, string>;
} {
    const parsed = generalSchema.safeParse(values);
    if (parsed.success) {
        return { success: true, errors: {} };
    }
    const errors: Record<string, string> = {};
    const { fieldErrors } = z.flattenError(parsed.error);
    if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([key, messages]) => {
            if (messages?.[0]) errors[key] = messages[0];
        });
    }
    return { success: false, errors };
}
