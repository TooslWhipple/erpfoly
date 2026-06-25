import { useCallback, useState } from "react";
import type { FamilyReference, ReferencesTabErrors, ReferencesTabValues } from "@/types/credit-application-form.types";
import { isValidMxPhone, normalizeMxPhone } from "./fieldValidation";

function parseNumericValue(value: string): number {
  return Number.parseFloat(value.replace(/,/g, "").trim());
}

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
    let nextValue = field === "phone" ? normalizeMxPhone(value) : value;

    if (field === "seniorityYears") {
      nextValue = String(value).replace(/[^0-9]/g, "");
    }

    const nextValues = { ...values, [field]: nextValue };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    return nextValues;
  }, [values]);

  const setReferenceFieldValue = useCallback((referenceId: string, field: keyof Omit<FamilyReference, "id">, value: string) => {
    const nextValue = field === "phone" ? normalizeMxPhone(value) : value;
    const nextReferences = values.familyReferences.map((reference) =>
      reference.id === referenceId ? { ...reference, [field]: nextValue } : reference
    );
    const nextValues = { ...values, familyReferences: nextReferences };
    setValues(nextValues);
    setErrors((prev) => {
      const next = { ...prev };
      if (next.familyReferenceItems?.[referenceId]) {
        next.familyReferenceItems = {
          ...next.familyReferenceItems,
          [referenceId]: {
            ...next.familyReferenceItems[referenceId],
            [field]: undefined,
          },
        };
      }
      if (field === "name" || field === "relationshipId" || field === "address" || field === "phone") {
        next.familyReferences = undefined;
      }
      return next;
    });
    return nextValues;
  }, [values]);

  const addReference = useCallback(() => {
    const nextValues = {
      ...values,
      familyReferences: [...values.familyReferences, createEmptyReference(values.familyReferences.length + 1)],
    };
    setValues(nextValues);
    setErrors((prev) => ({ ...prev, familyReferences: undefined }));
    return nextValues;
  }, [values]);

  const removeReference = useCallback((referenceId: string) => {
    if (values.familyReferences.length <= 1) return values;
    const nextValues = {
      ...values,
      familyReferences: values.familyReferences.filter((reference) => reference.id !== referenceId),
    };
    setValues(nextValues);
    setErrors((prev) => {
      const next = { ...prev };
      if (next.familyReferenceItems?.[referenceId]) {
        const { [referenceId]: _removed, ...restItems } = next.familyReferenceItems;
        next.familyReferenceItems = restItems;
      }
      next.familyReferences = undefined;
      return next;
    });
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: ReferencesTabValues) => {
    setValues(nextValues);
    setErrors({});
  }, []);

  const validateValues = useCallback((silent?: boolean) => {
    const nextErrors: ReferencesTabErrors = {};
    if (!values.company.trim()) nextErrors.company = "Empresa es requerida";
    if (!values.phone.trim()) nextErrors.phone = "Teléfono es requerido";
    else if (!isValidMxPhone(values.phone)) nextErrors.phone = "El teléfono debe tener 10 dígitos";
    if (!values.clientPosition.trim()) nextErrors.clientPosition = "Puesto del cliente es requerido";
    if (!values.seniorityYears.trim()) nextErrors.seniorityYears = "Antigüedad es requerida";
    else {
      const seniorityYears = parseNumericValue(values.seniorityYears);
      if (!Number.isFinite(seniorityYears) || seniorityYears <= 0 || !Number.isInteger(seniorityYears)) {
        nextErrors.seniorityYears = "La antigüedad debe ser un número entero positivo";
      }
    }
    if (!values.respondentNameAndPosition.trim()) {
      nextErrors.respondentNameAndPosition = "Nombre de la persona laboral es requerido";
    }

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

    const familyReferenceItems = values.familyReferences.reduce<NonNullable<ReferencesTabErrors["familyReferenceItems"]>>((acc, reference) => {
      const referenceErrors: NonNullable<ReferencesTabErrors["familyReferenceItems"]>[string] = {};
      if (!reference.name.trim()) referenceErrors.name = "Nombre es requerido";
      if (!reference.relationshipId.trim()) referenceErrors.relationshipId = "Parentesco es requerido";
      if (!reference.address.trim()) referenceErrors.address = "Dirección es requerida";
      if (!reference.phone.trim()) referenceErrors.phone = "Teléfono es requerido";
      else if (!isValidMxPhone(reference.phone)) {
        referenceErrors.phone = "El teléfono debe tener 10 dígitos";
      }
      if (Object.keys(referenceErrors).length > 0) {
        acc[reference.id] = referenceErrors;
      }
      return acc;
    }, {});
    if (Object.keys(familyReferenceItems).length > 0) {
      nextErrors.familyReferenceItems = familyReferenceItems;
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
    setReferenceFieldValue,
    addReference,
    removeReference,
    setValuesFromExternalSource,
    validateValues,
  };
}
