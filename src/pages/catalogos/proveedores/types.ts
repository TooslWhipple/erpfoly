/**
 * Supplier-related types for the proveedores catalog (create/edit form).
 */

export interface SupplierContact {
    id: string;
    position: string;
    name: string;
    phone: string;
}

export interface BankAccount {
    id: string;
    bank: string;
    city: string;
    branch: string;
    account: string;
}

export interface CreditData {
    attention: string;
    position: string;
    phone: string;
}

export interface Promotion {
    id: string;
    description: string;
    percentage: string;
    startDate: string;
    endDate: string;
}

export interface Supplier {
    id: number;
    name: string;
    businessName: string;
    rfc: string;
    website: string;
    email: string;
    type: "nacional" | "extranjera";
    paymentTerm: number;
    freight: "pagado" | "cobrar";
    observations?: string;
    contacts: SupplierContact[];
    creditData: CreditData;
    bankAccounts: BankAccount[];
    promotions: Promotion[];
}

/** Shape of general tab form values (for typing field change handlers). */
export interface GeneralFormValues {
    name: string;
    businessName: string;
    rfc: string;
    website: string;
    email: string;
    type: "nacional" | "extranjera";
    paymentTerm: string;
    freight: "pagado" | "cobrar";
    observations: string;
}
