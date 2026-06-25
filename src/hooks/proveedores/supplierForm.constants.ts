export type SupplierFormTab = "general" | "contacts" | "credit";

export { SUPPLIER_TEXT_MAX_LENGTH } from "@/forms/validation/schemas/proveedores";

export const SUPPLIER_FORM_TABS: Array<{ value: SupplierFormTab; label: string }> = [
    { value: "general", label: "Datos generales" },
    { value: "contacts", label: "Contactos" },
    { value: "credit", label: "Datos crediticios" },
];

export function isSupplierFormTab(value: string): value is SupplierFormTab {
    return SUPPLIER_FORM_TABS.some((tab) => tab.value === value);
}

const GENERAL_ERROR_FIELDS = ["name", "businessName", "rfc", "website", "email", "paymentTerm"] as const;

export function hasSupplierTabErrors(
    tab: SupplierFormTab,
    errors: Record<string, string>,
): boolean {
    if (tab === "general") {
        return GENERAL_ERROR_FIELDS.some((field) => Boolean(errors[field]));
    }
    if (tab === "contacts") {
        return Object.keys(errors).some((key) => key.startsWith("contacts."));
    }
    if (tab === "credit") {
        return Object.keys(errors).some((key) => key.startsWith("creditData."));
    }
    return false;
}
