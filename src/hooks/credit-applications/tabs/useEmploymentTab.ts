import { useCallback, useState } from "react";
import type { EmploymentTabErrors, EmploymentTabValues } from "@/types/credit-application-form.types";

export function useEmploymentTab(initialValues: EmploymentTabValues) {
  const [values, setValues] = useState<EmploymentTabValues>(initialValues);
  const [errors, setErrors] = useState<EmploymentTabErrors>({});

  const setFieldValue = useCallback((field: keyof EmploymentTabValues, value: EmploymentTabValues[keyof EmploymentTabValues]) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: EmploymentTabValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const validateValues = useCallback(() => {
    const nextErrors: EmploymentTabErrors = {};
    if (!values.company.trim()) nextErrors.company = "Empresa es requerida";
    if (!values.postalCode.trim()) nextErrors.postalCode = "Código postal es requerido";
    if (!values.state.trim()) nextErrors.state = "Estado es requerido";
    if (!values.city.trim()) nextErrors.city = "Ciudad es requerida";
    if (!values.streetAndNumber.trim()) nextErrors.streetAndNumber = "Calle y número es requerido";
    if (!values.monthlyIncome.trim()) nextErrors.monthlyIncome = "Ingreso mensual es requerido";

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
