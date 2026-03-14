import { z } from "zod";
import { messages } from "../messages";

/**
 * Schemas genéricos reutilizables para validación de formularios.
 * Usar con defineFormFields() o directamente en useFormWithZod.
 */
export const schemas = {
    requiredString(minLength = 1, msg: string = messages.required) {
        return z.string().min(minLength, msg);
    },

    optionalString() {
        return z.string().optional();
    },

    stringRange(min: number, max: number, requiredMsg = messages.required) {
        return z
            .string()
            .min(1, requiredMsg)
            .min(min, messages.string.min(min))
            .max(max, messages.string.max(max));
    },

    emailString(requiredMsg = messages.required) {
        return z.email({ error: messages.string.email }).min(1, requiredMsg);
    },

    phoneString(digitsLength = 10, requiredMsg = messages.required) {
        return z
            .string()
            .min(1, requiredMsg)
            .refine(
                (val) => val.replace(/\D/g, "").length === digitsLength,
                messages.string.phone,
            );
    },

    numberRange(min: number, max: number) {
        return z
            .number("Debe ser un número")
            .min(min, messages.number.min(min))
            .max(max, messages.number.max(max));
    },

    decimalString(maxFractionDigits = 2, requiredMsg: string = messages.required) {
        const re = new RegExp(`^\\d*\\.?\\d{0,${maxFractionDigits}}$`);
        return z
            .string()
            .min(1, requiredMsg)
            .refine(
                (val) => re.test(val) && !/^\.$/.test(val),
                "El valor no es un número válido",
            );
    },
} as const;
