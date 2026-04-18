import { useCallback, useState } from "react";
import type { GuarantorTabErrors, GuarantorTabValues } from "@/types/credit-application-form.types";
import { isValidMxPostalCode } from "@/forms/validation/schemas";
import {
  cleanAlphaNumeric,
  isAdultBirthDate,
  isValidCurp,
  isValidMxPhone,
  isValidRfc,
  normalizeMxPhone,
} from "./fieldValidation";

export function useGuarantorTab(initialValues: GuarantorTabValues) {
  const [values, setValues] = useState<GuarantorTabValues>(initialValues);
  const [errors, setErrors] = useState<GuarantorTabErrors>({});

  const setFieldValue = useCallback((field: keyof GuarantorTabValues, value: GuarantorTabValues[keyof GuarantorTabValues]) => {
    let nextValue = value;
    if (field === "curp") {
      nextValue = cleanAlphaNumeric(String(value)).slice(0, 18);
    }
    if (field === "rfc") {
      nextValue = cleanAlphaNumeric(String(value)).slice(0, 13);
    }
    if (field === "phone") {
      nextValue = normalizeMxPhone(String(value));
    }
    const nextValues = { ...values, [field]: nextValue };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return nextValues;
  }, [values]);

  const mergeFieldValues = useCallback((patch: Partial<GuarantorTabValues>) => {
    const nextValues = { ...values, ...patch };
    setValues(nextValues);
    setErrors((prev) => {
      const next: GuarantorTabErrors = { ...prev };
      (Object.keys(patch) as string[]).forEach((key) => {
        if (key in next) {
          delete next[key as keyof GuarantorTabErrors];
        }
      });
      return next;
    });
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: GuarantorTabValues) => {
    setValues({
      ...nextValues,
      identificationFrontFiles: nextValues.identificationFrontFiles ?? [],
      identificationBackFiles: nextValues.identificationBackFiles ?? [],
    });
    setErrors({});
  }, []);

  const validateValues = useCallback(() => {
    const nextErrors: GuarantorTabErrors = {};
    if (!values.fullName.trim()) nextErrors.fullName = "Nombre completo es requerido";
    if (!values.postalCode.trim()) nextErrors.postalCode = "Código postal es requerido";
    else if (!isValidMxPostalCode(values.postalCode)) {
      nextErrors.postalCode = "El código postal debe tener 5 dígitos";
    }
    if (!values.neighborhoodFullCode.trim() || values.neighborhoodFullCode === "-1") {
      nextErrors.neighborhoodFullCode = "Selecciona una colonia";
    }
    if (!values.state.trim()) nextErrors.state = "Estado es requerido";
    if (!values.city.trim()) nextErrors.city = "Ciudad es requerida";
    if (!values.streetAndNumber.trim()) nextErrors.streetAndNumber = "Calle y número es requerido";
    if (!values.betweenStreets.trim()) nextErrors.betweenStreets = "Entre calles es requerido";
    if (!values.birthDate.trim()) nextErrors.birthDate = "Fecha de nacimiento es requerida";
    else if (!isAdultBirthDate(values.birthDate)) {
      nextErrors.birthDate = "La fecha de nacimiento debe corresponder a una persona mayor de edad";
    }
    if (!values.maritalStatus.trim()) nextErrors.maritalStatus = "Estado civil es requerido";
    if (!values.curp.trim()) nextErrors.curp = "CURP es requerido";
    else if (!isValidCurp(values.curp)) nextErrors.curp = "CURP inválido";
    if (!values.rfc.trim()) nextErrors.rfc = "RFC es requerido";
    else if (!isValidRfc(values.rfc)) nextErrors.rfc = "RFC inválido";
    if (!values.phone.trim()) nextErrors.phone = "Teléfono es requerido";
    else if (!isValidMxPhone(values.phone)) nextErrors.phone = "El teléfono debe tener 10 dígitos";
    if (values.identificationFrontFiles.length === 0) {
      nextErrors.identificationFrontFiles = "INE frontal es requerida";
    }
    if (values.identificationBackFiles.length === 0) {
      nextErrors.identificationBackFiles = "INE posterior es requerida";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  return {
    values,
    errors,
    setFieldValue,
    mergeFieldValues,
    setValuesFromExternalSource,
    validateValues,
  };
}
