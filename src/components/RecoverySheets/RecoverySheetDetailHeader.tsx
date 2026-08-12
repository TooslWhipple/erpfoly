import { Button, Typography } from "@mui/material";
import { ClipboardList, ExternalLink } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { RECOVERY_SHEET_ORIGIN_LABELS } from "@/types/recovery-sheets.types";
import type { RecoverySheetDetail } from "@/types/recovery-sheets.types";
import {
  DetailBadgeRow,
  DetailHeroSection,
  DetailMetaGrid,
  DetailMetaItem,
  invoiceLinkButtonSx,
} from "./styles";

export interface RecoverySheetDetailHeaderProps {
  detail: RecoverySheetDetail;
  onInvoiceClick?: () => void;
}

export function RecoverySheetDetailHeader({
  detail,
  onInvoiceClick,
}: RecoverySheetDetailHeaderProps) {
  const theme = useTheme();

  return (
    <DetailHeroSection>
      <DetailBadgeRow>
        <ClipboardList size={16} color={theme.palette.primary.main} />
        <Typography variant="body2" fontWeight={600} color="primary.main">
          Hoja de recuperación
        </Typography>
      </DetailBadgeRow>

      <Typography variant="body2" color="text.secondary">
        {detail.articleCode}
      </Typography>

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

      <DetailMetaGrid>
        <DetailMetaItem>
          <Typography variant="body2" color="text.secondary">
            Origen
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {RECOVERY_SHEET_ORIGIN_LABELS[detail.origin]}
          </Typography>
        </DetailMetaItem>

        <DetailMetaItem>
          <Typography variant="body2" color="text.secondary">
            Factura
          </Typography>
          <Button
            variant="text"
            onClick={onInvoiceClick}
            endIcon={<ExternalLink size={14} />}
            sx={invoiceLinkButtonSx}
          >
            {detail.invoiceNumber}
          </Button>
        </DetailMetaItem>
      </DetailMetaGrid>
    </DetailHeroSection>
  );
}
