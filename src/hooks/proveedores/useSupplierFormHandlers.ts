import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
    sanitizeRfc,
    sanitizePhone,
    SUPPLIER_TEXT_MAX_LENGTH,
} from "@/forms/validation/schemas";
import type {
    BankAccount,
    GeneralFormValues,
    SupplierContact,
} from "@/types/proveedores.types";
import type { SupplierFormAction } from "./supplierForm.reducer";

interface UseSupplierFormHandlersParams {
    dispatchForm: Dispatch<SupplierFormAction>;
    errors: Record<string, string>;
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;
    createTempId: () => string;
}

const GENERAL_TEXT_MAX_FIELDS = new Set<keyof GeneralFormValues>(["name", "businessName"]);

function clampSupplierText(value: string): string {
    return value.slice(0, SUPPLIER_TEXT_MAX_LENGTH);
}

function contactErrorKey(contactIndex: number, field: keyof SupplierContact): string {
    return `contacts.${contactIndex}.${field}`;
}

export function useSupplierFormHandlers({
    dispatchForm,
    errors,
    setErrors,
    createTempId,
}: UseSupplierFormHandlersParams) {
    const handleGeneralFieldChange = useCallback(
        (field: keyof GeneralFormValues, value: string) => {
            const nextValue =
                field === "rfc"
                    ? sanitizeRfc(value)
                    : GENERAL_TEXT_MAX_FIELDS.has(field)
                      ? clampSupplierText(value)
                      : value;
            dispatchForm({ type: "update_general_field", field, value: nextValue });
            if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
        },
        [dispatchForm, errors, setErrors],
    );

    const handleAddContact = useCallback(() => {
        dispatchForm({ type: "add_contact", id: createTempId() });
    }, [dispatchForm, createTempId]);

    const handleRemoveContact = useCallback(
        (contactId: string) => {
            dispatchForm({ type: "remove_contact", contactId });
        },
        [dispatchForm],
    );

    const handleContactChange = useCallback(
        (
            contactId: string,
            contactIndex: number,
            field: keyof SupplierContact,
            value: string | number | null,
        ) => {
            const nextValue =
                field === "phone" && typeof value === "string"
                    ? sanitizePhone(value)
                    : field === "name" && typeof value === "string"
                      ? clampSupplierText(value)
                      : value;
            dispatchForm({ type: "update_contact", contactId, field, value: nextValue });
            const errorKey = contactErrorKey(contactIndex, field);
            if (errors[errorKey]) {
                setErrors((prev) => ({ ...prev, [errorKey]: "" }));
            }
        },
        [dispatchForm, errors, setErrors],
    );

    const handleCreditDataChange = useCallback(
        (field: "attention" | "jobTitleId" | "phone", value: string | number | null) => {
            const nextValue =
                field === "phone" && typeof value === "string"
                    ? sanitizePhone(value)
                    : field === "attention" && typeof value === "string"
                      ? clampSupplierText(value)
                      : value;
            dispatchForm({ type: "update_credit_data", field, value: nextValue });
            const errorKey = `creditData.${field}`;
            if (errors[errorKey]) {
                setErrors((prev) => ({ ...prev, [errorKey]: "" }));
            }
        },
        [dispatchForm, errors, setErrors],
    );

    const handleAddBankAccount = useCallback(() => {
        dispatchForm({ type: "add_bank_account", id: createTempId() });
    }, [dispatchForm, createTempId]);

    const handleRemoveBankAccount = useCallback(
        (accountId: string) => {
            dispatchForm({ type: "remove_bank_account", accountId });
        },
        [dispatchForm],
    );

    const handleBankAccountChange = useCallback(
        (accountId: string, field: keyof BankAccount, value: string) => {
            dispatchForm({ type: "update_bank_account", accountId, field, value });
        },
        [dispatchForm],
    );

    return {
        handleGeneralFieldChange,
        handleAddContact,
        handleRemoveContact,
        handleContactChange,
        handleCreditDataChange,
        handleAddBankAccount,
        handleRemoveBankAccount,
        handleBankAccountChange,
    };
}
