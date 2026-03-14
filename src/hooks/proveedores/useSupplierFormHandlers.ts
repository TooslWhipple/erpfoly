import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
    BankAccount,
    GeneralFormValues,
    Promotion,
    SupplierContact,
} from "@/types/proveedores.types";
import type { SupplierFormAction } from "./supplierForm.reducer";

interface UseSupplierFormHandlersParams {
    dispatchForm: Dispatch<SupplierFormAction>;
    errors: Record<string, string>;
    setErrors: Dispatch<SetStateAction<Record<string, string>>>;
    createTempId: () => string;
}

export function useSupplierFormHandlers({
    dispatchForm,
    errors,
    setErrors,
    createTempId,
}: UseSupplierFormHandlersParams) {
    const handleGeneralFieldChange = useCallback(
        (field: keyof GeneralFormValues, value: string) => {
            dispatchForm({ type: "update_general_field", field, value });
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
            field: keyof SupplierContact,
            value: string | number | null,
        ) => {
            dispatchForm({ type: "update_contact", contactId, field, value });
        },
        [dispatchForm],
    );

    const handleCreditDataChange = useCallback(
        (field: "attention" | "jobTitleId" | "phone", value: string | number | null) => {
            dispatchForm({ type: "update_credit_data", field, value });
        },
        [dispatchForm],
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

    const handleAddPromotion = useCallback(() => {
        dispatchForm({ type: "add_promotion", id: createTempId() });
    }, [dispatchForm, createTempId]);

    const handleRemovePromotion = useCallback(
        (promotionId: string) => {
            dispatchForm({ type: "remove_promotion", promotionId });
        },
        [dispatchForm],
    );

    const handlePromotionChange = useCallback(
        (promotionId: string, field: keyof Promotion, value: string) => {
            dispatchForm({ type: "update_promotion", promotionId, field, value });
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
        handleAddPromotion,
        handleRemovePromotion,
        handlePromotionChange,
    };
}
