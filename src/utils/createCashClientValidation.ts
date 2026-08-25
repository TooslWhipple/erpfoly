import { isValidMxPostalCode } from "@/forms/validation/schemas";
import { isValidEmail } from "@/forms/validation/schemas/creditApplication";
import { isValidMxPhone } from "@/hooks/credit-applications/tabs/fieldValidation";
import type { BillingFormValues } from "@/hooks/useBillingFieldsForm";

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

export type BasicInfoFormErrors = Partial<
  Record<keyof BasicInfoFormValues, string>
>;

export type AddressFormErrors = Partial<
  Record<keyof AddressFormValues, string>
>;

export type BillingFormErrors = Partial<
  Record<keyof BillingFormValues, string>
>;

export function validateBasicInfo(
  values: BasicInfoFormValues,
  isSecurityCodeValid: boolean | null,
): BasicInfoFormErrors {
  const errors: BasicInfoFormErrors = {};

  if (!values.firstName.trim()) {
    errors.firstName = "Nombre(s) es requerido";
  }
  if (!values.lastSurname.trim()) {
    errors.lastSurname = "Primer apellido es requerido";
  }

  const phone = values.phoneNumber.trim();
  if (phone) {
    if (!isValidMxPhone(phone)) {
      errors.phoneNumber = "El número de Whatsapp debe tener 10 dígitos";
    } else if (isSecurityCodeValid !== true) {
      if (!values.securityCode.trim()) {
        errors.securityCode = "Código de seguridad es requerido";
      } else if (values.securityCode.trim().length < 6) {
        errors.securityCode = "El código de seguridad debe tener 6 dígitos";
      } else {
        errors.securityCode = "Debes validar el código de seguridad";
      }
    }
  }

  if (values.email.trim() && !isValidEmail(values.email)) {
    errors.email = "Correo electrónico inválido";
  }

  return errors;
}

/** Address is optional; only validate format when the user started filling fields. */
export function validateAddressInfo(
  values: AddressFormValues,
): AddressFormErrors {
  const errors: AddressFormErrors = {};
  const postalCode = values.postalCode.trim();

  if (postalCode && !isValidMxPostalCode(postalCode)) {
    errors.postalCode = "El código postal debe tener 5 dígitos";
  }

  const receiverPhone = values.receiverPhone.trim();
  if (receiverPhone && !isValidMxPhone(receiverPhone)) {
    errors.receiverPhone = "El teléfono debe tener 10 dígitos";
  }

  return errors;
}

/** Billing was not enforced before; keep optional (format-only if filled later). */
export function validateBillingInfo(
  _values: BillingFormValues,
): BillingFormErrors {
  return {};
}

export function isBasicTabComplete(
  values: BasicInfoFormValues,
  isSecurityCodeValid: boolean | null,
): boolean {
  return Object.keys(validateBasicInfo(values, isSecurityCodeValid)).length === 0;
}

export function isAddressTabComplete(values: AddressFormValues): boolean {
  return Object.keys(validateAddressInfo(values)).length === 0;
}

export function isBillingTabComplete(_values: BillingFormValues): boolean {
  return true;
}

// ponytail: smallest runnable check — fails if required-field rules regress
if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
  const namesOnly = validateBasicInfo(
    {
      firstName: "Jose",
      lastSurname: "Test",
      secondSurname: "",
      email: "",
      phoneNumber: "",
      securityCode: "",
    },
    false,
  );
  const phoneWithoutOtp = validateBasicInfo(
    {
      firstName: "Jose",
      lastSurname: "Test",
      secondSurname: "",
      email: "",
      phoneNumber: "5512345678",
      securityCode: "",
    },
    false,
  );
  if (
    Object.keys(namesOnly).length > 0 ||
    !phoneWithoutOtp.securityCode
  ) {
    throw new Error("createCashClientValidation self-check failed");
  }
}
