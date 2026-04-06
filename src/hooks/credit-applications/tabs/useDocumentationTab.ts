import { useCallback, useState } from "react";
import type { DocumentationTabValues } from "@/types/credit-application-form.types";

export function useDocumentationTab(initialValues: DocumentationTabValues) {
  const [values, setValues] = useState<DocumentationTabValues>(initialValues);

  const setFieldValue = useCallback((field: keyof DocumentationTabValues, value: DocumentationTabValues[keyof DocumentationTabValues]) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    return nextValues;
  }, [values]);

  const setValuesFromExternalSource = useCallback((nextValues: DocumentationTabValues) => {
    setValues({
      requiredAlertVisible: nextValues.requiredAlertVisible,
      requiredAlertMessage: nextValues.requiredAlertMessage,
      incomeProofFiles: nextValues.incomeProofFiles ?? [],
      ineFrontFiles: nextValues.ineFrontFiles ?? [],
      ineBackFiles: nextValues.ineBackFiles ?? [],
    });
  }, []);

  return {
    values,
    setFieldValue,
    setValuesFromExternalSource,
    validateValues: () => {
      const hasIncomeProof = values.incomeProofFiles.length > 0;
      const hasIneFront = values.ineFrontFiles.length > 0;
      const hasIneBack = values.ineBackFiles.length > 0;
      return hasIncomeProof && hasIneFront && hasIneBack;
    },
  };
}
