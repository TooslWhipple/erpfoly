import { Button, Typography } from "@mui/material";
import { ExternalLink } from "lucide-react";
import { formatDateOnly } from "@/utils/date";
import {
  RECOVERY_SHEET_ORIGIN_LABELS,
  RECOVERY_SHEET_ITEM_CONDITION_LABELS,
} from "@/types/recovery-sheets.types";
import type { RecoverySheetDetail } from "@/types/recovery-sheets.types";
import {
  DetailSummaryBar,
  DetailSummaryCell,
  invoiceLinkButtonSx,
} from "./styles";

export interface RecoverySheetSummaryBarProps {
  detail: RecoverySheetDetail;
  onInvoiceClick?: () => void;
}

export function RecoverySheetSummaryBar({
  detail,
  onInvoiceClick,
}: RecoverySheetSummaryBarProps) {
  const warehouseLabel = detail.storageBranchName.trim() || "—";
  const warehouseHint = detail.warehouse
    ? `${RECOVERY_SHEET_ITEM_CONDITION_LABELS[detail.warehouse.itemCondition]} · ${formatDateOnly(detail.warehouse.entryDate, "dateLong")}`
    : null;

  return (
    <DetailSummaryBar>
      <DetailSummaryCell>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ letterSpacing: 0.4, textTransform: "uppercase" }}
        >
          Origen
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {RECOVERY_SHEET_ORIGIN_LABELS[detail.origin]}
        </Typography>
      </DetailSummaryCell>

      <DetailSummaryCell>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ letterSpacing: 0.4, textTransform: "uppercase" }}
        >
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
      </DetailSummaryCell>

      <DetailSummaryCell>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ letterSpacing: 0.4, textTransform: "uppercase" }}
        >
          Almacén
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: "anywhere" }}>
          {warehouseLabel}
        </Typography>
        {warehouseHint ? (
          <Typography variant="caption" color="text.secondary">
            {warehouseHint}
          </Typography>
        ) : null}
      </DetailSummaryCell>

      <DetailSummaryCell>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ letterSpacing: 0.4, textTransform: "uppercase" }}
        >
          Fecha de generación
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {formatDateOnly(detail.createdAt, "dateLong")}
        </Typography>
      </DetailSummaryCell>
    </DetailSummaryBar>
  );
}
