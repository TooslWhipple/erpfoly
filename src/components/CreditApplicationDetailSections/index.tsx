import type { ReactNode } from "react";
import type { CreditApplicationDetailSection } from "@/types/solicitud-credito-detail.types";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { BasicInfoSection } from "./BasicInfoSection";
import { AddressSection } from "./AddressSection";
import { FamilySection } from "./FamilySection";
import { EmploymentSection } from "./EmploymentSection";
import { ReferencesSection } from "./ReferencesSection";
import { DocumentationSection } from "./DocumentationSection";
import { CreditBureauSection } from "./CreditBureauSection";
import { BiometricsSection } from "./BiometricsSection";
import { PurchaseIntentionSection } from "./PurchaseIntentionSection";

export interface SectionContentProps {
  detail: CreditApplicationDetail;
  activeSection: CreditApplicationDetailSection;
  onOpenImageViewer: (
    title: string,
    subtitle: string,
    url: string,
    backgroundColor?: string,
  ) => void;
  onConsultBuro?: () => void | Promise<void>;
  isConsultingBuro?: boolean;
}

const SECTION_MAP: Record<
  CreditApplicationDetailSection,
  (props: SectionContentProps) => ReactNode
> = {
  basic: (props) => <BasicInfoSection detail={props.detail} />,
  address: (props) => <AddressSection detail={props.detail} />,
  family: (props) => <FamilySection detail={props.detail} />,
  employment: (props) => <EmploymentSection detail={props.detail} />,
  references: (props) => <ReferencesSection detail={props.detail} />,
  documentation: (props) => (
    <DocumentationSection detail={props.detail} onOpenImageViewer={props.onOpenImageViewer} />
  ),
  "credit-bureau": (props) => (
    <CreditBureauSection
      detail={props.detail}
      onOpenImageViewer={props.onOpenImageViewer}
      onConsultBuro={props.onConsultBuro}
      isConsultingBuro={props.isConsultingBuro}
    />
  ),
  biometrics: (props) => (
    <BiometricsSection detail={props.detail} onOpenImageViewer={props.onOpenImageViewer} />
  ),
  "purchase-intention": (props) => <PurchaseIntentionSection detail={props.detail} />,
};

export function SectionContent({
  detail,
  activeSection,
  onOpenImageViewer,
  onConsultBuro,
  isConsultingBuro,
}: SectionContentProps) {
  const RenderSection = SECTION_MAP[activeSection];
  if (!RenderSection) return null;
  return (
    <>
      {RenderSection({
        detail,
        activeSection,
        onOpenImageViewer,
        onConsultBuro,
        isConsultingBuro,
      })}
    </>
  );
}
