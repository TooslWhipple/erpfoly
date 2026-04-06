import { useCallback, useState } from "react";
import type { FamilyTabErrors, FamilyTabValues } from "@/types/credit-application-form.types";

export function useFamilyTab(initialValues: FamilyTabValues) {
  const [values, setValues] = useState<FamilyTabValues>(initialValues);
  const [errors, setErrors] = useState<FamilyTabErrors>({});

  const setFieldValue = useCallback((field: keyof FamilyTabValues, value: FamilyTabValues[keyof FamilyTabValues]) => {
    const nextValues = { ...values, [field]: value };
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
