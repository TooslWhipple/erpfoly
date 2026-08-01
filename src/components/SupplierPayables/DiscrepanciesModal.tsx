import { useMemo } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import type { SupplierPayableDiscrepancy } from "@/types/supplier-payables.types";
import { formatDate } from "@/utils/date";
import { DiscrepancyCard } from "./styles";

export interface DiscrepanciesModalProps {
  open: boolean;
  onClose: () => void;
  discrepancies: SupplierPayableDiscrepancy[];
  loading?: boolean;
  onReviewStatement: (statementId: string) => void;
}

export function DiscrepanciesModal({
  open,
  onClose,
  discrepancies,
  loading = false,
  onReviewStatement,
}: DiscrepanciesModalProps) {
  const content = useMemo(() => {
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" py={6} spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Cargando discrepancias...
          </Typography>
        </Stack>
      );
    }

    if (discrepancies.length === 0) {
      return (
        <Stack alignItems="center" justifyContent="center" py={6}>
          <Typography variant="body2" color="text.secondary">
            No hay discrepancias pendientes
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack spacing={1.5}>
        {discrepancies.map((item) => (
          <DiscrepancyCard key={item.id}>
            <Stack spacing={0.5} flex={1} minWidth={0}>
              <Typography variant="subtitle2" noWrap>
                {item.supplierName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {item.periodLabel} · {item.movementConcept}
                {item.movementDate
                  ? ` · ${formatDate(item.movementDate, "dateLong")}`
                  : ""}
              </Typography>
              <Typography variant="subtitle2">
                {numeral(item.amount).format("$0,0.00")}
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              onClick={() => onReviewStatement(item.statementId)}
            >
              Revisar
            </Button>
          </DiscrepancyCard>
        ))}
      </Stack>
    );
  }, [discrepancies, loading, onReviewStatement]);

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Discrepancias sin resolver"
      description="Movimientos que requieren atención antes de registrar pagos."
      maxWidth="md"
      headerActionsPosition="top"
    >
      {content}
    </SideModal>
  );
}
