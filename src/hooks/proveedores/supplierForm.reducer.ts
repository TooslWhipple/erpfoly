import type { GeneralFormValues, Supplier } from "@/types/proveedores.types";
import type { SupplierFormState } from "./mappers";

interface ItemWithStringId {
    id: string;
}

function updateItemById<T extends ItemWithStringId>(
    items: T[],
    itemId: string,
    updater: (item: T) => T,
): T[] {
    return items.map((item) => (item.id === itemId ? updater(item) : item));
}

function removeItemById<T extends ItemWithStringId>(items: T[], itemId: string): T[] {
    return items.filter((item) => item.id !== itemId);
}

export type SupplierFormAction =
    | { type: "set_form_state"; payload: SupplierFormState }
    | { type: "update_general_field"; field: keyof GeneralFormValues; value: string }
    | { type: "add_contact"; id: string }
    | { type: "remove_contact"; contactId: string }
    | {
          type: "update_contact";
          contactId: string;
          field: keyof Supplier["contacts"][0];
          value: string | number | null;
      }
    | {
          type: "update_credit_data";
          field: "attention" | "jobTitleId" | "phone";
          value: string | number | null;
      }
    | { type: "add_bank_account"; id: string }
    | { type: "remove_bank_account"; accountId: string }
    | {
          type: "update_bank_account";
          accountId: string;
          field: keyof Supplier["bankAccounts"][0];
          value: string;
      }
    | { type: "add_promotion"; id: string }
    | { type: "remove_promotion"; promotionId: string }
    | {
          type: "update_promotion";
          promotionId: string;
          field: keyof Supplier["promotions"][0];
          value: string;
      };

export function supplierFormReducer(
    state: SupplierFormState,
    action: SupplierFormAction,
): SupplierFormState {
    switch (action.type) {
        case "set_form_state":
            return action.payload;
        case "update_general_field":
            return { ...state, [action.field]: action.value } as SupplierFormState;
        case "add_contact":
            return {
                ...state,
                contacts: [
                    ...state.contacts,
                    { id: action.id, jobTitleId: null, name: "", phone: "" },
                ],
            };
        case "remove_contact": {
            const index = state.contacts.findIndex((contact) => contact.id === action.contactId);
            if (index <= 1) return state;
            return {
                ...state,
                contacts: removeItemById(state.contacts, action.contactId),
            };
        }
        case "update_contact":
            return {
                ...state,
                contacts: updateItemById(state.contacts, action.contactId, (contact) => ({
                    ...contact,
                    [action.field]: action.value,
                })),
            };
        case "update_credit_data":
            return {
                ...state,
                ...(action.field === "attention" && { creditAttention: String(action.value) }),
                ...(action.field === "jobTitleId" && {
                    creditJobTitleId: action.value as number | null,
                }),
                ...(action.field === "phone" && { creditPhone: String(action.value) }),
            };
        case "add_bank_account":
            return {
                ...state,
                bankAccounts: [
                    ...state.bankAccounts,
                    { id: action.id, bank: "", city: "", branch: "", account: "" },
                ],
            };
        case "remove_bank_account":
            return {
                ...state,
                bankAccounts: removeItemById(state.bankAccounts, action.accountId),
            };
        case "update_bank_account":
            return {
                ...state,
                bankAccounts: updateItemById(
                    state.bankAccounts,
                    action.accountId,
                    (bankAccount) => ({
                        ...bankAccount,
                        [action.field]: action.value,
                    }),
                ),
            };
        case "add_promotion":
            return {
                ...state,
                promotions: [
                    ...state.promotions,
                    {
                        id: action.id,
                        description: "",
                        percentage: "0.00",
                        startDate: "",
                        endDate: "",
                    },
                ],
            };
        case "remove_promotion":
            return {
                ...state,
                promotions: removeItemById(state.promotions, action.promotionId),
            };
        case "update_promotion":
            return {
                ...state,
                promotions: updateItemById(state.promotions, action.promotionId, (promotion) => ({
                    ...promotion,
                    [action.field]: action.value,
                })),
            };
        default:
            return state;
    }
}
