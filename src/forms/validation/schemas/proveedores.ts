import { z } from "zod";
import { schemas } from "./common";
import { isValidRfc, isValidPhone } from "./creditApplication";

export const SUPPLIER_TEXT_MAX_LENGTH = 70;

const maxLenMsg = `Debe tener máximo ${SUPPLIER_TEXT_MAX_LENGTH} caracteres`;

function isValidWebsiteUrl(value: string): boolean {
    if (!value.startsWith("http://") && !value.startsWith("https://")) return false;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

const contactItemSchema = z.object({
    jobTitleId: z.number().nullable(),
    name: z.string(),
    phone: z.string(),
});

const creditDataSchema = z.object({
    attention: z.string(),
    jobTitleId: z.number().nullable(),
    phone: z.string(),
});

export const generalSchema = z.object({
    name: schemas
        .requiredString(1, "El nombre es requerido")
        .max(SUPPLIER_TEXT_MAX_LENGTH, maxLenMsg),
    businessName: schemas
        .requiredString(1, "La razón social es requerida")
        .max(SUPPLIER_TEXT_MAX_LENGTH, maxLenMsg),
    rfc: z
        .string()
        .min(1, "RFC es requerido")
        .refine(isValidRfc, "RFC inválido"),
    website: z
        .string()
        .optional()
        .refine(
            (v) => !v || isValidWebsiteUrl(v),
            "La URL no es válida",
        ),
    email: schemas.emailString("El email es requerido"),
    paymentTerm: z
        .string()
        .min(1, "El plazo de pagos es requerido")
        .refine((v) => Number(v) > 0, "El plazo de pagos debe ser mayor a 0"),
});

export const contactsSchema = z
    .array(contactItemSchema)
    .min(1, "Debe registrar al menos un contacto");

export const creditSchema = creditDataSchema;

export type GeneralSchemaInput = z.input<typeof generalSchema>;
export type ContactsSchemaInput = z.input<typeof contactsSchema>;
export type CreditSchemaInput = z.input<typeof creditSchema>;

function flattenZodErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};
    const { fieldErrors } = z.flattenError(error);
    if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([key, messages]) => {
            const first = Array.isArray(messages) ? messages[0] : undefined;
            if (first) errors[key] = first;
        });
    }
    return errors;
}

export function validateGeneralForm(values: GeneralSchemaInput): {
    success: boolean;
    errors: Record<string, string>;
} {
    const parsed = generalSchema.safeParse(values);
    if (parsed.success) {
        return { success: true, errors: {} };
    }
    return { success: false, errors: flattenZodErrors(parsed.error) };
}

export function validateContactsForm(contacts: ContactsSchemaInput): {
    success: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};

    const parsed = contactsSchema.safeParse(contacts);
    if (!parsed.success) {
        Object.assign(errors, flattenZodErrors(parsed.error));
    }

    contacts.forEach((contact, index) => {
        const prefix = `contacts.${index}`;
        const name = contact.name.trim();
        const phone = contact.phone.trim();
        const hasJobTitle = contact.jobTitleId != null && contact.jobTitleId > 0;
        const hasAny = hasJobTitle || name !== "" || phone !== "";

        if (index === 0) {
            if (!hasJobTitle) errors[`${prefix}.jobTitleId`] = "El cargo es requerido";
            if (!name) errors[`${prefix}.name`] = "El nombre es requerido";
            else if (name.length > SUPPLIER_TEXT_MAX_LENGTH) {
                errors[`${prefix}.name`] = maxLenMsg;
            }
            if (!phone) errors[`${prefix}.phone`] = "El número es requerido";
            else if (!isValidPhone(phone)) errors[`${prefix}.phone`] = "El teléfono debe tener 10 dígitos";
            return;
        }

        if (!hasAny) return;

        if (!hasJobTitle) errors[`${prefix}.jobTitleId`] = "El cargo es requerido";
        if (!name) errors[`${prefix}.name`] = "El nombre es requerido";
        else if (name.length > SUPPLIER_TEXT_MAX_LENGTH) {
            errors[`${prefix}.name`] = maxLenMsg;
        }
        if (!phone) errors[`${prefix}.phone`] = "El número es requerido";
        else if (!isValidPhone(phone)) errors[`${prefix}.phone`] = "El teléfono debe tener 10 dígitos";
    });

    return { success: Object.keys(errors).length === 0, errors };
}

export function validateCreditForm(values: CreditSchemaInput): {
    success: boolean;
    errors: Record<string, string>;
} {
    const errors: Record<string, string> = {};
    const attention = values.attention.trim();
    const phone = values.phone.trim();
    const hasJobTitle = values.jobTitleId != null && values.jobTitleId > 0;

    if (!attention) errors["creditData.attention"] = "La atención es requerida";
    else if (attention.length > SUPPLIER_TEXT_MAX_LENGTH) {
        errors["creditData.attention"] = maxLenMsg;
    }
    if (!hasJobTitle) errors["creditData.jobTitleId"] = "El puesto es requerido";
    if (!phone) errors["creditData.phone"] = "El número es requerido";
    else if (!isValidPhone(phone)) {
        errors["creditData.phone"] = "El teléfono debe tener 10 dígitos";
    }

    const parsed = creditSchema.safeParse(values);
    if (!parsed.success && Object.keys(errors).length === 0) {
        Object.assign(errors, flattenZodErrors(parsed.error));
    }

    return { success: Object.keys(errors).length === 0, errors };
}
