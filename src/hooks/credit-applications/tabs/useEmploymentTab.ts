import { useCallback, useState } from "react";
import type { EmploymentTabErrors, EmploymentTabValues } from "@/types/credit-application-form.types";
import { isValidMxPostalCode } from "@/forms/validation/schemas";
import { isValidMxPhone, normalizeMxPhone } from "./fieldValidation";

function parseNumericValue(value: string): number {
  return Number.parseFloat(value.replace(/,/g, "").trim());
}

const EMPTY_SPOUSE_EMPLOYMENT_FIELDS: Pick<
  EmploymentTabValues,
  | "spouseCompany"
  | "spousePostalCode"
  | "spouseNeighborhoodFullCode"
  | "spouseState"
  | "spouseCity"
  | "spouseStreetAndNumber"
  | "spouseSeniorityYears"
  | "spousePosition"
  | "spouseDepartment"
  | "spouseMonthlyIncome"
  | "spouseCompanyPhone"
> = {
  spouseCompany: "",
  spousePostalCode: "",
  spouseNeighborhoodFullCode: "",
  spouseState: "",
  spouseCity: "",
  spouseStreetAndNumber: "",
  spouseSeniorityYears: "",
  spousePosition: "",
  spouseDepartment: "",
  spouseMonthlyIncome: "",
  spouseCompanyPhone: "",
};

function validateSpouseEmploymentFields(
  values: EmploymentTabValues,
  nextErrors: EmploymentTabErrors,
): void {
  if (!values.spouseCompany.trim()) nextErrors.spouseCompany = "Empresa es requerida";
  if (!values.spousePostalCode.trim()) nextErrors.spousePostalCode = "Código postal es requerido";
  else if (!isValidMxPostalCode(values.spousePostalCode)) {
    nextErrors.spousePostalCode = "El código postal debe tener 5 dígitos";
  }
  if (!values.spouseNeighborhoodFullCode.trim() || values.spouseNeighborhoodFullCode === "-1") {
    nextErrors.spouseNeighborhoodFullCode = "Selecciona una colonia";
  }
  if (!values.spouseState.trim()) nextErrors.spouseState = "Estado es requerido";
  if (!values.spouseCity.trim()) nextErrors.spouseCity = "Ciudad es requerida";
  if (!values.spouseStreetAndNumber.trim()) {
    nextErrors.spouseStreetAndNumber = "Calle y número es requerido";
  }
  if (!values.spouseSeniorityYears.trim()) nextErrors.spouseSeniorityYears = "Antigüedad es requerida";
  else {
    const spouseSeniorityYears = parseNumericValue(values.spouseSeniorityYears);
    if (
      !Number.isFinite(spouseSeniorityYears) ||
      spouseSeniorityYears <= 0 ||
      !Number.isInteger(spouseSeniorityYears)
    ) {
      nextErrors.spouseSeniorityYears = "La antigüedad debe ser un número entero positivo";
    }
  }
  if (!values.spousePosition.trim()) nextErrors.spousePosition = "Puesto es requerido";
  if (!values.spouseDepartment.trim()) nextErrors.spouseDepartment = "Departamento es requerido";
  if (!values.spouseMonthlyIncome.trim()) nextErrors.spouseMonthlyIncome = "Ingreso mensual es requerido";
  else {
    const spouseMonthlyIncome = parseNumericValue(values.spouseMonthlyIncome);
    if (
      !Number.isFinite(spouseMonthlyIncome) ||
      spouseMonthlyIncome <= 0 ||
      !Number.isInteger(spouseMonthlyIncome)
    ) {
      nextErrors.spouseMonthlyIncome = "El ingreso mensual debe ser un número entero positivo";
    }
  }
  if (!values.spouseCompanyPhone.trim()) {
    nextErrors.spouseCompanyPhone = "Teléfono de la empresa es requerido";
  } else if (!isValidMxPhone(values.spouseCompanyPhone)) {
    nextErrors.spouseCompanyPhone = "El teléfono de la empresa del cónyuge debe tener 10 dígitos";
  }
}

export function useEmploymentTab(initialValues: EmploymentTabValues) {
  const [values, setValues] = useState<EmploymentTabValues>(initialValues);
  const [errors, setErrors] = useState<EmploymentTabErrors>({});

  const setFieldValue = useCallback((field: keyof EmploymentTabValues, value: EmploymentTabValues[keyof EmploymentTabValues]) => {
    if (field === "spouseHasEmployment" && value === false) {
      const nextValues = {
        ...values,
        spouseHasEmployment: false,
        ...EMPTY_SPOUSE_EMPLOYMENT_FIELDS,
      };
      setValues(nextValues);
      setErrors((prev) => {
        const next = { ...prev };
        (Object.keys(EMPTY_SPOUSE_EMPLOYMENT_FIELDS) as Array<keyof EmploymentTabErrors>).forEach((key) => {
          delete next[key];
        });
        return next;
      });
      return nextValues;
    }

    let nextValue = value;
    
    if (field === "companyPhone" || field === "spouseCompanyPhone") {
      nextValue = normalizeMxPhone(String(value));
    }
    
    if (field === "seniorityYears" || field === "spouseSeniorityYears") {
      const numericValue = String(value).replace(/[^0-9]/g, "");
      nextValue = numericValue as EmploymentTabValues[keyof EmploymentTabValues];
    }
    
    if (field === "monthlyIncome" || field === "spouseMonthlyIncome" || field === "otherIncomeAmount") {
      const numericValue = String(value).replace(/[^0-9]/g, "");
      nextValue = numericValue as EmploymentTabValues[keyof EmploymentTabValues];
    }
    
    const nextValues = { ...values, [field]: nextValue };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return nextValues;
  }, [values]);

  const mergeFieldValues = useCallback((patch: Partial<EmploymentTabValues>) => {
    const nextValues = { ...values, ...patch };
    setValues(nextValues);
    setErrors((prev) => {
      const next: EmploymentTabErrors = { ...prev };
      (Object.keys(patch) as string[]).forEach((key) => {
        if (key in next) {
          delete next[key as keyof EmploymentTabErrors];
        }
      });
      return next;
    });
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: EmploymentTabValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const validateValues = useCallback((silent?: boolean) => {
    const nextErrors: EmploymentTabErrors = {};
    if (!values.company.trim()) nextErrors.company = "Empresa es requerida";
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
    if (!values.seniorityYears.trim()) nextErrors.seniorityYears = "Antigüedad es requerida";
    else {
      const seniorityYears = parseNumericValue(values.seniorityYears);
      if (!Number.isFinite(seniorityYears) || seniorityYears <= 0 || !Number.isInteger(seniorityYears)) {
        nextErrors.seniorityYears = "La antigüedad debe ser un número entero positivo";
      }
    }
    if (!values.position.trim()) nextErrors.position = "Puesto es requerido";
    if (!values.department.trim()) nextErrors.department = "Departamento es requerido";
    if (!values.monthlyIncome.trim()) nextErrors.monthlyIncome = "Ingreso mensual es requerido";
    else {
      const monthlyIncome = parseNumericValue(values.monthlyIncome);
      if (!Number.isFinite(monthlyIncome) || monthlyIncome <= 0 || !Number.isInteger(monthlyIncome)) {
        nextErrors.monthlyIncome = "El ingreso mensual debe ser un número entero positivo";
      }
    }
    if (!values.companyPhone.trim()) nextErrors.companyPhone = "Teléfono de la empresa es requerido";
    else if (!isValidMxPhone(values.companyPhone)) {
      nextErrors.companyPhone = "El teléfono de la empresa debe tener 10 dígitos";
    }

    if (values.hasOtherIncome) {
      if (!values.otherIncomeAmount.trim()) {
        nextErrors.otherIncomeAmount = "Monto es requerido";
      } else {
        const otherIncomeAmount = parseNumericValue(values.otherIncomeAmount);
        if (
          !Number.isFinite(otherIncomeAmount) ||
          otherIncomeAmount <= 0 ||
          !Number.isInteger(otherIncomeAmount)
        ) {
          nextErrors.otherIncomeAmount = "El monto debe ser un número entero positivo";
        }
      }
      if (!values.otherIncomeSource.trim()) {
        nextErrors.otherIncomeSource = "Especifique el origen del ingreso";
      }
    }

    if (values.spouseHasEmployment) {
      validateSpouseEmploymentFields(values, nextErrors);
    }

    if (!silent) {
      setErrors(nextErrors);
    }
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
