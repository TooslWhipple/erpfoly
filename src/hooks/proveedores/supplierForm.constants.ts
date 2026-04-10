export type SupplierFormTab = "general" | "contacts" | "credit" | "promotions";

export const SUPPLIER_FORM_TABS: Array<{ value: SupplierFormTab; label: string }> = [
    { value: "general", label: "Datos generales" },
    { value: "contacts", label: "Contactos" },
    { value: "credit", label: "Datos crediticios" },
    { value: "promotions", label: "Promociones" },
];

export function isSupplierFormTab(value: string): value is SupplierFormTab {
    return SUPPLIER_FORM_TABS.some((tab) => tab.value === value);
}
