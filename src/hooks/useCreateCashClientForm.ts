import { useState, useCallback } from "react";
import {
  INITIAL_BILLING_FORM_VALUES,
  type BillingFormValues,
} from "@/hooks/useBillingFieldsForm";
import {
  type AddressFormErrors,
  type AddressFormValues,
  type BasicInfoFormErrors,
  type BasicInfoFormValues,
  type BillingFormErrors,
  validateAddressInfo,
  validateBasicInfo,
  validateBillingInfo,
} from "@/utils/createCashClientValidation";

export type { AddressFormValues, BasicInfoFormValues };

export type { BillingFormValues };
export type CreateCashClientTab = "basic" | "address" | "billing";

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
  const [basicErrors, setBasicErrors] = useState<BasicInfoFormErrors>({});
  const [addressErrors, setAddressErrors] = useState<AddressFormErrors>({});
  const [billingErrors, setBillingErrors] = useState<BillingFormErrors>({});

  const setBasicValue = useCallback(
    (field: keyof BasicInfoFormValues, value: string) => {
      setValues((prev) => ({
        ...prev,
        basic: {
          ...prev.basic,
          [field]: value,
        },
      }));
      setBasicErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
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
      setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
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
      setBillingErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const resetForm = useCallback(() => {
    setValues({
      basic: initialBasicInfo,
      address: initialAddress,
      billing: initialBilling,
    });
    setBasicErrors({});
    setAddressErrors({});
    setBillingErrors({});
    setActiveTab("basic");
  }, []);

  const validateBasicTab = useCallback(
    (isSecurityCodeValid: boolean | null, silent = false) => {
      const nextErrors = validateBasicInfo(values.basic, isSecurityCodeValid);
      if (!silent) {
        setBasicErrors(nextErrors);
      }
      return Object.keys(nextErrors).length === 0;
    },
    [values.basic],
  );

  const validateAddressTab = useCallback((silent = false) => {
    const nextErrors = validateAddressInfo(values.address);
    if (!silent) {
      setAddressErrors(nextErrors);
    }
    return Object.keys(nextErrors).length === 0;
  }, [values.address]);

  const validateBillingTab = useCallback((silent = false) => {
    const nextErrors = validateBillingInfo(values.billing);
    if (!silent) {
      setBillingErrors(nextErrors);
    }
    return Object.keys(nextErrors).length === 0;
  }, [values.billing]);

  const setBasicFieldError = useCallback(
    (field: keyof BasicInfoFormValues, message?: string) => {
      setBasicErrors((prev) => ({ ...prev, [field]: message }));
    },
    [],
  );

  return {
    activeTab,
    setActiveTab,
    values,
    basicErrors,
    addressErrors,
    billingErrors,
    setBasicValue,
    setAddressValue,
    setBillingValue,
    setBasicFieldError,
    resetForm,
    validateBasicTab,
    validateAddressTab,
    validateBillingTab,
  };
}
