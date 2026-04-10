import { useCallback, useMemo, useState } from "react";
import { validateSecurityCode } from "@/services/creditApplications.service";
import type {
  BasicInformationFormErrors,
  BasicInformationFormValues,
} from "@/types/credit-application-form.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanAlphaNumeric(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

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
      field === "curp" || field === "rfc" ? cleanAlphaNumeric(value) : value;
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
    if (!values.maritalStatus.trim()) nextErrors.maritalStatus = "Estado civil es requerido";
    if (!values.curp.trim()) nextErrors.curp = "CURP es requerido";
    if (!values.rfc.trim()) nextErrors.rfc = "RFC es requerido";

    if (!values.email.trim()) {
      nextErrors.email = "Correo electrónico es requerido";
    } else if (!EMAIL_REGEX.test(values.email)) {
      nextErrors.email = "Correo electrónico inválido";
    }

    if (!values.whatsappNumber.trim()) {
      nextErrors.whatsappNumber = "Número de Whatsapp es requerido";
    }

    if (!values.securityCode.trim()) {
      nextErrors.securityCode = "Código de seguridad es requerido";
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
  };
}
