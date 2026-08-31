import { Typography } from "@mui/material";
import { BasicInfoSection } from "@/components/CreditApplicationDetailSections/BasicInfoSection";
import { toCreditApplicationDetailForBasic } from "@/lib/delinquencyClientInfoMapper";
import type { SharedDelinquencyBasicInformation } from "@/types/delinquency-shared-list.types";

export interface GeneralInformationTabProps {
  basicInformation: SharedDelinquencyBasicInformation | null;
}

export function GeneralInformationTab({
  basicInformation,
}: GeneralInformationTabProps) {
  if (!basicInformation) {
    return (
      <Typography variant="body2" color="text.secondary">
        No hay información general registrada
      </Typography>
    );
  }

  return (
    <BasicInfoSection
      detail={toCreditApplicationDetailForBasic(basicInformation)}
    />
  );
}
