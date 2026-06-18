import type { CreditApplicationTabId } from "@/types/credit-application-form.types";

export type CreditApplicationSectionKey = keyof {
  basicInformation: never;
  family: never;
  address: never;
  employment: never;
  references: never;
  documentation: never;
  guarantor: never;
};

export const CREDIT_APPLICATION_SECTION_ORDER: CreditApplicationSectionKey[] = [
  "basicInformation",
  "family",
  "address",
  "employment",
  "references",
  "documentation",
  "guarantor",
];

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
