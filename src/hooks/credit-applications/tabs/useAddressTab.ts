import { useCallback, useState } from "react";
import type { AddressTabErrors, AddressTabValues } from "@/types/credit-application-form.types";

export function useAddressTab(initialValues: AddressTabValues) {
  const [values, setValues] = useState<AddressTabValues>(initialValues);
  const [errors, setErrors] = useState<AddressTabErrors>({});

  const setFieldValue = useCallback((field: keyof AddressTabValues, value: AddressTabValues[keyof AddressTabValues]) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: AddressTabValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const validateValues = useCallback(() => {
    const nextErrors: AddressTabErrors = {};

    if (!values.postalCode.trim()) nextErrors.postalCode = "Código postal es requerido";
    if (!values.state.trim()) nextErrors.state = "Estado es requerido";
    if (!values.city.trim()) nextErrors.city = "Ciudad es requerida";
    if (!values.streetAndNumber.trim()) nextErrors.streetAndNumber = "Calle y número es requerido";
    if (!values.receiverPhone.trim()) nextErrors.receiverPhone = "Teléfono es requerido";
    if (!values.receiverName.trim()) nextErrors.receiverName = "Nombre de quien recibe es requerido";
    if (!values.residenceTime.trim()) nextErrors.residenceTime = "Tiempo en el domicilio es requerido";
    if (!values.previousAddress.trim()) nextErrors.previousAddress = "Domicilio anterior es requerido";
    if (!values.previousResidenceTime.trim()) nextErrors.previousResidenceTime = "Tiempo en el domicilio anterior es requerido";
    if (!values.betweenStreets.trim()) nextErrors.betweenStreets = "Entre calles es requerido";

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
