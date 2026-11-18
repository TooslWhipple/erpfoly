import { Stack, Typography } from "@mui/material";
import { ClipboardList } from "lucide-react";
import { StatusChip } from "@/components";
import type { RecoverySheetDetail } from "@/types/recovery-sheets.types";
import { RECOVERY_SHEET_INTAKE_LABELS } from "@/types/recovery-sheets.types";
import { articleBadgeSx, DetailHeroSection } from "./styles";

export interface RecoverySheetDetailHeaderProps {
  detail: RecoverySheetDetail;
}

export function RecoverySheetDetailHeader({
  detail,
}: RecoverySheetDetailHeaderProps) {
  const intake = detail.warehouseIntake;

  return (
    <DetailHeroSection>
      <Typography
        variant="h4"
        fontWeight={700}
        sx={{
          lineHeight: 1.2,
          fontSize: { xs: "1.375rem", sm: "1.5rem", md: "1.75rem" },
          overflowWrap: "anywhere",
        }}
      >
        {detail.articleDescription}
      </Typography>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography
          component="div"
          variant="body2"
          fontWeight={600}
          sx={articleBadgeSx}
        >
          <ClipboardList size={15} />
          Hoja de recuperación
          <Typography
            component="span"
            variant="body2"
            color="text.secondary"
            fontWeight={500}
            sx={{ ml: 0.25 }}
          >
            {detail.articleCode}
          </Typography>
        </Typography>
        {intake ? (
          <StatusChip
            label={RECOVERY_SHEET_INTAKE_LABELS[intake]}
            variant={intake === "cliente_entrega" ? "info" : "pending"}
          />
        ) : null}
      </Stack>
    </DetailHeroSection>
  );
}
