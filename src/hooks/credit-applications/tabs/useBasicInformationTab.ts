import { useCallback, useMemo, useState } from "react";
import { checkIdentityConflicts, validateSecurityCode } from "@/services/creditApplications.service";
import type {
  BasicInformationFormErrors,
  BasicInformationFormValues,
} from "@/types/credit-application-form.types";
import {
  cleanAlphaNumeric,
  isAdultBirthDate,
  isValidCurp,
  isValidMxPhone,
  isValidRfc,
  normalizeMxPhone,
} from "./fieldValidation";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useBasicInformationTab(initialValues: BasicInformationFormValues) {
  const [values, setValues] = useState<BasicInformationFormValues>(initialValues);
  const [errors, setErrors] = useState<BasicInformationFormErrors>({});
  const [validatingSecurityCode, setValidatingSecurityCode] = useState(false);
  const [isSecurityCodeValid, setIsSecurityCodeValid] = useState<boolean | null>(null);

  const isDirty = useMemo(() => {
    return Object.values(values).some((value) => value.trim().length > 0);
  }, [values]);

  const setFieldValue = useCallback((field: keyof BasicInformationFormValues, value: string) => {
    const nextValue =
      field === "curp"
        ? cleanAlphaNumeric(value).slice(0, 18)
        : field === "rfc"
          ? cleanAlphaNumeric(value).slice(0, 13)
        : field === "whatsappNumber"
          ? normalizeMxPhone(value)
          : value;
    const nextValues = { ...values, [field]: nextValue };

    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (field === "securityCode") {
      setIsSecurityCodeValid(null);
    }
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: BasicInformationFormValues) => {
    setValues(nextValues);
    setErrors({});
    setIsSecurityCodeValid(null);
  }, []);

  const validateValues = useCallback((): boolean => {
    const nextErrors: BasicInformationFormErrors = {};

    if (!values.firstName.trim()) nextErrors.firstName = "Nombre(s) es requerido";
    if (!values.lastName.trim()) nextErrors.lastName = "Primer apellido es requerido";
    if (!values.secondLastName.trim()) nextErrors.secondLastName = "Segundo apellido es requerido";
    if (!values.birthDate.trim()) nextErrors.birthDate = "Fecha de nacimiento es requerida";
    else if (!isAdultBirthDate(values.birthDate)) {
      nextErrors.birthDate = "La fecha de nacimiento debe corresponder a una persona mayor de edad";
    }
    if (!values.maritalStatus.trim()) nextErrors.maritalStatus = "Estado civil es requerido";
    if (!values.curp.trim()) nextErrors.curp = "CURP es requerido";
    else if (!isValidCurp(values.curp)) nextErrors.curp = "CURP inválido";
    if (!values.rfc.trim()) nextErrors.rfc = "RFC es requerido";
    else if (!isValidRfc(values.rfc)) nextErrors.rfc = "RFC inválido";

    if (!values.email.trim()) {
      nextErrors.email = "Correo electrónico es requerido";
    } else if (!EMAIL_REGEX.test(values.email)) {
      nextErrors.email = "Correo electrónico inválido";
    }

    if (!values.whatsappNumber.trim()) {
      nextErrors.whatsappNumber = "Número de Whatsapp es requerido";
    } else if (!isValidMxPhone(values.whatsappNumber)) {
      nextErrors.whatsappNumber = "El número de Whatsapp debe tener 10 dígitos";
    }

    if (!values.securityCode.trim()) {
      nextErrors.securityCode = "Código de seguridad es requerido";
    } else if (values.securityCode.trim().length < 6) {
      nextErrors.securityCode = "El código de seguridad debe tener al menos 6 caracteres";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  const validateCurrentSecurityCode = useCallback(async (): Promise<boolean> => {
    if (!values.securityCode.trim()) {
      setErrors((prev) => ({ ...prev, securityCode: "Código de seguridad es requerido" }));
      setIsSecurityCodeValid(false);
      return false;
    }

    setValidatingSecurityCode(true);
    try {
      const isValid = await validateSecurityCode(values.securityCode);
      setIsSecurityCodeValid(isValid);
      setErrors((prev) => ({
        ...prev,
        securityCode: isValid ? undefined : "Código de seguridad inválido",
      }));
      return isValid;
    } finally {
      setValidatingSecurityCode(false);
    }
  }, [values.securityCode]);

  const getIdentityConflictError = useCallback(
    (
      field: keyof Pick<BasicInformationFormValues, "curp" | "rfc">,
      hasExistingClient: boolean,
      hasExistingApplication: boolean
    ): string | undefined => {
      if (!hasExistingClient && !hasExistingApplication) {
        return undefined;
      }

      const fieldLabel = field.toUpperCase();
      if (hasExistingClient && hasExistingApplication) {
        return `Ya existe un cliente y una solicitud con este ${fieldLabel}.`;
      }
      if (hasExistingClient) {
        return `Ya existe un cliente con este ${fieldLabel}.`;
      }
      return `Ya existe una solicitud con este ${fieldLabel}.`;
    },
    []
  );

  const validateIdentityField = useCallback(
    async (
      field: keyof Pick<BasicInformationFormValues, "curp" | "rfc">,
      currentApplicationId?: string
    ): Promise<boolean> => {
      const currentValue = values[field].trim();
      if (!currentValue) return false;

      try {
        const conflicts = await checkIdentityConflicts(currentValue, currentApplicationId);
        const conflictError = getIdentityConflictError(
          field,
          conflicts.hasExistingClient,
          conflicts.hasExistingApplication
        );

        setErrors((prev) => ({ ...prev, [field]: conflictError }));
        return !conflictError;
      } catch {
        setErrors((prev) => ({
          ...prev,
          [field]: `No se pudo validar el ${field.toUpperCase()}, intenta nuevamente.`,
        }));
        return false;
      }
    },
    [getIdentityConflictError, values]
  );

  const validateIdentityUniqueness = useCallback(
    async (currentApplicationId?: string): Promise<boolean> => {
      const [curpIsValid, rfcIsValid] = await Promise.all([
        validateIdentityField("curp", currentApplicationId),
        validateIdentityField("rfc", currentApplicationId),
      ]);

      return curpIsValid && rfcIsValid;
    },
    [validateIdentityField]
  );

  return {
    values,
    errors,
    isDirty,
    validatingSecurityCode,
    isSecurityCodeValid,
    setFieldValue,
    setValuesFromExternalSource,
    validateValues,
    validateCurrentSecurityCode,
    validateIdentityField,
    validateIdentityUniqueness,
  };
}
