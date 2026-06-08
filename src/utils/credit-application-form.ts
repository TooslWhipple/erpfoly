import type {
  CreditApplicationDocumentFile,
  CreditApplicationFormPayload,
  DocumentationTabValues,
  GuarantorTabValues,
} from "@/types/credit-application-form.types";

export type CreditApplicationSectionKey = keyof Omit<
  CreditApplicationFormPayload,
  "id" | "biometrics"
>;

export const CREDIT_APPLICATION_SECTION_ORDER: CreditApplicationSectionKey[] = [
  "basicInformation",
  "family",
  "address",
  "employment",
  "references",
  "documentation",
  "guarantor",
];

function serializeDocumentFiles(files: CreditApplicationDocumentFile[]): string {
  return JSON.stringify(
    files.map((file) => ({
      id: file.id,
      filePath: file.filePath ?? null,
      hasLocalFile: Boolean(file.file),
    }))
  );
}

function serializeDocumentationSection(values: DocumentationTabValues): string {
  return JSON.stringify({
    incomeProofFiles: serializeDocumentFiles(values.incomeProofFiles),
    employmentProofLetterFiles: serializeDocumentFiles(values.employmentProofLetterFiles),
    ineFrontFiles: serializeDocumentFiles(values.ineFrontFiles),
    ineBackFiles: serializeDocumentFiles(values.ineBackFiles),
  });
}

function serializeGuarantorSection(values: GuarantorTabValues): string {
  return JSON.stringify({
    ...values,
    identificationFrontFiles: serializeDocumentFiles(values.identificationFrontFiles),
    identificationBackFiles: serializeDocumentFiles(values.identificationBackFiles),
  });
}

export function serializeCreditApplicationSection(
  section: CreditApplicationSectionKey,
  payload: Pick<CreditApplicationFormPayload, CreditApplicationSectionKey>
): string {
  switch (section) {
    case "basicInformation":
      return JSON.stringify(payload.basicInformation);
    case "family":
      return JSON.stringify(payload.family);
    case "address":
      return JSON.stringify(payload.address);
    case "employment":
      return JSON.stringify(payload.employment);
    case "references":
      return JSON.stringify(payload.references);
    case "documentation":
      return serializeDocumentationSection(payload.documentation);
    case "guarantor":
      return serializeGuarantorSection(payload.guarantor);
    default:
      return "";
  }
}

export function buildCreditApplicationSectionSnapshots(
  payload: Pick<CreditApplicationFormPayload, CreditApplicationSectionKey>
): Record<CreditApplicationSectionKey, string> {
  return CREDIT_APPLICATION_SECTION_ORDER.reduce(
    (snapshots, section) => ({
      ...snapshots,
      [section]: serializeCreditApplicationSection(section, payload),
    }),
    {} as Record<CreditApplicationSectionKey, string>
  );
}

export function getDirtyCreditApplicationSections(
  payload: Pick<CreditApplicationFormPayload, CreditApplicationSectionKey>,
  savedSnapshots: Partial<Record<CreditApplicationSectionKey, string>>,
  options?: { includeGuarantorSection?: boolean }
): CreditApplicationSectionKey[] {
  const includeGuarantorSection = options?.includeGuarantorSection ?? true;

  return CREDIT_APPLICATION_SECTION_ORDER.filter((section) => {
    if (section === "guarantor" && !includeGuarantorSection) {
      return false;
    }

    const savedSnapshot = savedSnapshots[section];
    if (!savedSnapshot) {
      return true;
    }

    return serializeCreditApplicationSection(section, payload) !== savedSnapshot;
  });
}

export function creditApplicationTabIdToSection(
  tabId: string
): CreditApplicationSectionKey | null {
  const mapping: Record<string, CreditApplicationSectionKey> = {
    "basic-information": "basicInformation",
    family: "family",
    address: "address",
    employment: "employment",
    references: "references",
    documentation: "documentation",
    guarantor: "guarantor",
  };

  return mapping[tabId] ?? null;
}
