import { useState, useCallback } from "react";
import {
  INITIAL_BILLING_FORM_VALUES,
  type BillingFormValues,
} from "@/hooks/useBillingFieldsForm";

export type { BillingFormValues };
export type CreateCashClientTab = "basic" | "address" | "billing";

export interface BasicInfoFormValues {
  firstName: string;
  lastSurname: string;
  secondSurname: string;
  email: string;
  phoneNumber: string;
  securityCode: string;
}

export interface AddressFormValues {
  postalCode: string;
  neighborhoodFullCode: string;
  state: string;
  city: string;
  street: string;
  externalNumber: string;
  internalNumber: string;
  betweenStreets: string;
  receiverPhone: string;
  receiverName: string;
  useClientPhone: boolean;
}

export interface CreateCashClientFormValues {
  basic: BasicInfoFormValues;
  address: AddressFormValues;
  billing: BillingFormValues;
}

const initialBasicInfo: BasicInfoFormValues = {
  firstName: "",
  lastSurname: "",
  secondSurname: "",
  email: "",
  phoneNumber: "",
  securityCode: "",
};

const initialAddress: AddressFormValues = {
  postalCode: "",
  neighborhoodFullCode: "",
  state: "",
  city: "",
  street: "",
  externalNumber: "",
  internalNumber: "",
  betweenStreets: "",
  receiverPhone: "",
  receiverName: "",
  useClientPhone: false,
};

const initialBilling: BillingFormValues = INITIAL_BILLING_FORM_VALUES;

export function useCreateCashClientForm() {
  const [activeTab, setActiveTab] = useState<CreateCashClientTab>("basic");
  const [values, setValues] = useState<CreateCashClientFormValues>({
    basic: initialBasicInfo,
    address: initialAddress,
    billing: initialBilling,
  });

  const setBasicValue = useCallback(
    (field: keyof BasicInfoFormValues, value: string) => {
      setValues((prev) => ({
        ...prev,
        basic: {
          ...prev.basic,
          [field]: value,
        },
      }));
    },
    []
  );

  const setAddressValue = useCallback(
    (field: keyof AddressFormValues, value: string | boolean) => {
      setValues((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value,
        },
      }));
    },
    []
  );

  const setBillingValue = useCallback(
    (field: keyof BillingFormValues, value: string | boolean) => {
      setValues((prev) => ({
        ...prev,
        billing: {
          ...prev.billing,
          [field]: value,
        },
      }));
    },
    []
  );

  const resetForm = useCallback(() => {
    setValues({
      basic: initialBasicInfo,
      address: initialAddress,
      billing: initialBilling,
    });
    setActiveTab("basic");
  }, []);

  const canContinueBasic = useCallback(
    (isSecurityCodeValid: boolean | null) => {
      const hasRequiredFields =
        values.basic.firstName.trim().length > 0 &&
        values.basic.lastSurname.trim().length > 0;

      if (!hasRequiredFields) return false;

      const hasPhoneNumber = values.basic.phoneNumber.trim().length === 10;
      if (hasPhoneNumber && isSecurityCodeValid !== true) {
        return false;
      }

      return true;
    },
    [values.basic]
  );

  const canContinueAddress = useCallback(() => {
    return true; // La dirección es opcional
  }, []);

  return {
    activeTab,
    setActiveTab,
    values,
    setBasicValue,
    setAddressValue,
    setBillingValue,
    resetForm,
    canContinueBasic,
    canContinueAddress,
  };
}
