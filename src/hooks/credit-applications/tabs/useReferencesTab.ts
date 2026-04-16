import { useCallback, useState } from "react";
import type { FamilyReference, ReferencesTabErrors, ReferencesTabValues } from "@/types/credit-application-form.types";

function createEmptyReference(index: number): FamilyReference {
  return {
    id: `reference-${Date.now()}-${index}`,
    name: "",
    relationshipId: "",
    address: "",
    phone: "",
  };
}

export function useReferencesTab(initialValues: ReferencesTabValues) {
  const [values, setValues] = useState<ReferencesTabValues>(initialValues);
  const [errors, setErrors] = useState<ReferencesTabErrors>({});

  const setFieldValue = useCallback((field: keyof Omit<ReferencesTabValues, "familyReferences">, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return nextValues;
  }, [values]);

  const setReferenceFieldValue = useCallback((referenceId: string, field: keyof Omit<FamilyReference, "id">, value: string) => {
    const nextReferences = values.familyReferences.map((reference) =>
      reference.id === referenceId ? { ...reference, [field]: value } : reference
    );
    const nextValues = { ...values, familyReferences: nextReferences };
    setValues(nextValues);
    return nextValues;
  }, [values]);

  const addReference = useCallback(() => {
    const nextValues = {
      ...values,
      familyReferences: [...values.familyReferences, createEmptyReference(values.familyReferences.length + 1)],
    };
    setValues(nextValues);
    return nextValues;
  }, [values]);

  const removeReference = useCallback((referenceId: string) => {
    if (values.familyReferences.length <= 1) return values;
    const nextValues = {
      ...values,
      familyReferences: values.familyReferences.filter((reference) => reference.id !== referenceId),
    };
    setValues(nextValues);
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: ReferencesTabValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const validateValues = useCallback(() => {
    const nextErrors: ReferencesTabErrors = {};
    if (!values.company.trim()) nextErrors.company = "Empresa es requerida";
    if (!values.phone.trim()) nextErrors.phone = "Teléfono es requerido";
    if (!values.clientPosition.trim()) nextErrors.clientPosition = "Puesto del cliente es requerido";
    if (!values.seniorityYears.trim()) nextErrors.seniorityYears = "Antigüedad es requerida";
    if (!values.respondentNameAndPosition.trim()) nextErrors.respondentNameAndPosition = "Este campo es requerido";

    const hasCompleteFamilyReference = values.familyReferences.some(
      (reference) =>
        reference.name.trim().length > 0 &&
        reference.relationshipId.trim().length > 0 &&
        reference.address.trim().length > 0 &&
        reference.phone.trim().length > 0
    );
    if (!hasCompleteFamilyReference) {
      nextErrors.familyReferences =
        "Debes capturar al menos una referencia familiar completa (nombre, parentesco, dirección y teléfono).";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [values]);

  return {
    values,
    errors,
    setFieldValue,
    setReferenceFieldValue,
    addReference,
    removeReference,
    setValuesFromExternalSource,
    validateValues,
  };
}
