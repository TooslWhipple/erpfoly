import { useCallback, useState } from "react";

export interface BillingFormValues {
  requiresInvoice: boolean;
  rfc: string;
  businessName: string;
  taxRegimeId: string;
  cfdiUseId: string;
  fiscalPostalCode: string;
  fiscalNeighborhoodFullCode: string;
  fiscalState: string;
  fiscalCity: string;
  fiscalStreet: string;
  fiscalExternalNumber: string;
  sendInvoiceByEmail: boolean;
  sendInvoiceByWhatsapp: boolean;
  invoiceEmail: string;
  invoiceWhatsappNumber: string;
}

export const INITIAL_BILLING_FORM_VALUES: BillingFormValues = {
  requiresInvoice: false,
  rfc: "",
  businessName: "",
  taxRegimeId: "",
  cfdiUseId: "",
  fiscalPostalCode: "",
  fiscalNeighborhoodFullCode: "-1",
  fiscalState: "",
  fiscalCity: "",
  fiscalStreet: "",
  fiscalExternalNumber: "",
  sendInvoiceByEmail: false,
  sendInvoiceByWhatsapp: false,
  invoiceEmail: "",
  invoiceWhatsappNumber: "",
};

export function useBillingFieldsForm() {
  const [values, setValues] = useState<BillingFormValues>(INITIAL_BILLING_FORM_VALUES);

  const setValue = useCallback(
    (field: keyof BillingFormValues, value: string | boolean) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setValues(INITIAL_BILLING_FORM_VALUES);
  }, []);

  return { values, setValue, setValues, reset };
}
