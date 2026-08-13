import { useCallback, useState } from "react";
import type { AddressTabErrors, AddressTabValues } from "@/types/credit-application-form.types";
import { isValidMxPostalCode } from "@/forms/validation/schemas";

export function useAddressTab(initialValues: AddressTabValues) {
  const [values, setValues] = useState<AddressTabValues>(initialValues);
  const [errors, setErrors] = useState<AddressTabErrors>({});

  const setFieldValue = useCallback((field: keyof AddressTabValues, value: AddressTabValues[keyof AddressTabValues]) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return nextValues;
  }, [values]);

  const mergeFieldValues = useCallback((patch: Partial<AddressTabValues>) => {
    const nextValues = { ...values, ...patch };
    setValues(nextValues);
    setErrors((prev) => {
      const next: AddressTabErrors = { ...prev };
      (Object.keys(patch) as string[]).forEach((key) => {
        if (key in next) {
          delete next[key as keyof AddressTabErrors];
        }
      });
      return next;
    });
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: AddressTabValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const validateValues = useCallback((silent?: boolean) => {
    const nextErrors: AddressTabErrors = {};

    if (!values.postalCode.trim()) nextErrors.postalCode = "Código postal es requerido";
    else if (!isValidMxPostalCode(values.postalCode)) {
      nextErrors.postalCode = "El código postal debe tener 5 dígitos";
    }
    if (!values.neighborhoodFullCode.trim() || values.neighborhoodFullCode === "-1") {
      nextErrors.neighborhoodFullCode = "Selecciona una colonia";
    }
    if (!values.state.trim()) nextErrors.state = "Estado es requerido";
    if (!values.city.trim()) nextErrors.city = "Ciudad es requerida";
    if (!values.street.trim()) nextErrors.street = "Calle es requerida";
    if (!values.externalNumber.trim()) nextErrors.externalNumber = "Número exterior es requerido";
    if (!values.residenceTimeValue.trim()) {
      nextErrors.residenceTimeValue = "Tiempo en el domicilio es requerido";
    } else {
      const residenceTimeValue = Number.parseInt(values.residenceTimeValue, 10);
      if (!Number.isInteger(residenceTimeValue) || residenceTimeValue < 1 || residenceTimeValue > 99) {
        nextErrors.residenceTimeValue = "El tiempo en el domicilio debe ser un número entero entre 1 y 99";
      }
    }
    if (!values.residenceTimeUnit.trim()) nextErrors.residenceTimeUnit = "Selecciona una unidad";
    if (!values.betweenStreets.trim()) nextErrors.betweenStreets = "Entre calles es requerido";
    if (!values.housingType.trim()) nextErrors.housingType = "Tipo de vivienda es requerido";

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
