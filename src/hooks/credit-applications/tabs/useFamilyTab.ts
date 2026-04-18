import { useCallback, useState } from "react";
import type { FamilyTabErrors, FamilyTabValues } from "@/types/credit-application-form.types";
import { isValidMxPhone, normalizeMxPhone } from "./fieldValidation";

export function useFamilyTab(initialValues: FamilyTabValues) {
  const [values, setValues] = useState<FamilyTabValues>(initialValues);
  const [errors, setErrors] = useState<FamilyTabErrors>({});

  const setFieldValue = useCallback((field: keyof FamilyTabValues, value: FamilyTabValues[keyof FamilyTabValues]) => {
    const nextValue =
      field === "spousePhone" ? normalizeMxPhone(String(value)) : value;
    const nextValues = { ...values, [field]: nextValue };
    setValues(nextValues);
    if (field === "spouseName" || field === "spousePhone") {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: FamilyTabValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const validateValues = useCallback(() => {
    const nextErrors: FamilyTabErrors = {};

    if (values.hasSpouse) {
      if (!values.spouseName.trim()) {
        nextErrors.spouseName = "Nombre del cónyuge es requerido";
      }
      if (!values.spousePhone.trim()) {
        nextErrors.spousePhone = "Teléfono celular es requerido";
      } else if (!isValidMxPhone(values.spousePhone)) {
        nextErrors.spousePhone = "El teléfono celular debe tener 10 dígitos";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  return {
    values,
    errors,
    setFieldValue,
    setValuesFromExternalSource,
    validateValues,
  };
}
