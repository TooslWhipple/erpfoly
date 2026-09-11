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
      employmentProofLetterFiles: nextValues.employmentProofLetterFiles ?? [],
      ineFrontFiles: nextValues.ineFrontFiles ?? [],
      ineBackFiles: nextValues.ineBackFiles ?? [],
      faceCaptureFiles: nextValues.faceCaptureFiles ?? [],
    });
  }, []);

  return {
    values,
    setFieldValue,
    setValuesFromExternalSource,
    validateValues: (options?: {
      requireIncomeProof?: boolean;
      requireEmploymentProofLetter?: boolean;
      requireFaceMatchSuccess?: boolean;
      faceMatchStatus?: "SUCCESS" | "FAILED" | "NOT_VERIFIED" | null;
      silent?: boolean;
    }) => {
      const requiresIncomeProof = options?.requireIncomeProof ?? false;
      const requiresEmploymentProofLetter = options?.requireEmploymentProofLetter ?? false;
      const requireFaceMatchSuccess = options?.requireFaceMatchSuccess ?? false;
      const hasIncomeProof = values.incomeProofFiles.length > 0;
      const hasEmploymentProofLetter = values.employmentProofLetterFiles.length > 0;
      const hasIneFront = values.ineFrontFiles.length > 0;
      const hasIneBack = values.ineBackFiles.length > 0;
      const hasFaceCapture = (values.faceCaptureFiles?.length ?? 0) > 0;
      const faceMatchOk =
        !requireFaceMatchSuccess
        || (hasFaceCapture && options?.faceMatchStatus === "SUCCESS");
      return (
        (!requiresIncomeProof || hasIncomeProof) &&
        (!requiresEmploymentProofLetter || hasEmploymentProofLetter) &&
        hasIneFront &&
        hasIneBack &&
        faceMatchOk
      );
    },
  };
}
