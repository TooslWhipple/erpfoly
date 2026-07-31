import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { CircleAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SideModal } from "@/components/SideModal";
import { StatusChip } from "@/components/StatusChip";
import type { StatusChipVariant } from "@/components/StatusChip";
import { TabFilters } from "@/components/TabFilters";
import type { TabOption } from "@/components/TabFilters";
import { usePermissions } from "@/hooks/usePermissions";
import { SUPPLIER_PAYABLES_CREATE } from "@/lib/permissions";
import { getSupplierPayableStatement } from "@/services/supplier-payables.service";
import type {
  SupplierPayableStatement,
  SupplierPayableStatus,
} from "@/types/supplier-payables.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { AlertActionButton, AlertBanner } from "./styles";
import { StatementMovementsTab } from "./StatementMovementsTab";
import { StatementPaymentsTab } from "./StatementPaymentsTab";
import { StatementProgressBar } from "./StatementProgressBar";

export interface StatementDetailModalProps {
  open: boolean;
  statementId: string | null;
  onClose: () => void;
  onRegisterPayment: (statement: SupplierPayableStatement) => void;
  onReviewDiscrepancies?: () => void;
}

const STATUS_LABELS: Record<SupplierPayableStatus, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  overdue: "Retrasado",
};

const STATUS_VARIANTS: Record<SupplierPayableStatus, StatusChipVariant> = {
  pending: "warning",
  paid: "success",
  overdue: "error",
};

const DETAIL_TABS: TabOption[] = [
  { label: "Movimientos", value: "movements" },
  { label: "Pagos", value: "payments" },
];

export function StatementDetailModal({
  open,
  statementId,
  onClose,
  onRegisterPayment,
  onReviewDiscrepancies,
}: StatementDetailModalProps) {
  const theme = useTheme();
  const showError = useSnackbarStore((state) => state.showError);
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission(SUPPLIER_PAYABLES_CREATE);

  const [activeTab, setActiveTab] = useState("movements");

  const {
    data: statement,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["supplier-payable-statement", statementId],
    enabled: open && Boolean(statementId),
    queryFn: async () => {
      if (!statementId) return null;
      const result = await getSupplierPayableStatement(statementId);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
  });

  useEffect(() => {
    if (!open) setActiveTab("movements");
  }, [open]);

  useEffect(() => {
    if (isError) {
      showError(error?.message ?? "No se pudo cargar el estado de cuenta");
    }
  }, [error?.message, isError, showError]);

  const attentionCount = useMemo(
    () => statement?.movements.filter((m) => m.requiresAttention).length ?? 0,
    [statement],
  );

  const paymentsBlocked = attentionCount > 0;
  const registerDisabled =
    !statement ||
    paymentsBlocked ||
    statement.status === "paid" ||
    statement.balance <= 0 ||
    !canCreate;

  const headerContent = statement ? (
    <Stack spacing={2} width="100%" mt={0.5}>
      {attentionCount > 0 && (
        <AlertBanner
          severity="warning"
          icon={<CircleAlert size={16} color={theme.palette.warning.main} />}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            width="100%"
          >
            <Typography variant="body2" fontWeight={500}>
              {attentionCount === 1
                ? "1 movimiento requiere atención"
                : `${attentionCount} movimientos requieren atención`}
            </Typography>
            {onReviewDiscrepancies ? (
              <AlertActionButton
                variant="outlined"
                size="small"
                onClick={onReviewDiscrepancies}
              >
                Revisar
              </AlertActionButton>
            ) : null}
          </Stack>
        </AlertBanner>
      )}

      <Stack spacing={0.5}>
        <Typography
          variant="caption"
          color="text.secondary"
          letterSpacing={0.6}
          fontWeight={600}
        >
          ESTADO DE CUENTA
        </Typography>
        <Typography variant="h5">{statement.periodLabel}</Typography>
        <Typography variant="body2" color="text.secondary">
          Fecha límite de pago {statement.dueDateLabel}
        </Typography>
      </Stack>

      <StatementProgressBar
        paidAmount={statement.paidAmount}
        totalAmount={statement.amount}
      />
    </Stack>
  ) : null;

  return (
    <SideModal
      open={open}
      onClose={onClose}
      maxWidth="md"
      headerActionsPosition="top"
      headerActions={
        statement ? (
          <StatusChip
            label={STATUS_LABELS[statement.status]}
            variant={STATUS_VARIANTS[statement.status]}
            size="small"
          />
        ) : null
      }
      headerContent={headerContent}
    >
      {isLoading || !statement ? (
        <Stack alignItems="center" justifyContent="center" py={8} spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Cargando estado de cuenta...
          </Typography>
        </Stack>
      ) : (
        <Stack spacing={2} sx={{ minWidth: 0, width: "100%" }}>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%", minWidth: 0 }}
          >
            <Box
              sx={{
                flex: "0 1 auto",
                minWidth: 0,
                maxWidth: "calc(100% - 148px)",
              }}
            >
              <TabFilters
                tabs={DETAIL_TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              disabled={registerDisabled}
              onClick={() => onRegisterPayment(statement)}
              sx={{
                flexShrink: 0,
                whiteSpace: "nowrap",
                px: 2,
              }}
            >
              Registrar pago
            </Button>
          </Stack>

          <Box sx={{ minWidth: 0, width: "100%" }}>
            {activeTab === "movements" ? (
              <StatementMovementsTab
                movements={statement.movements}
                cargoSubtotal={statement.cargoSubtotal}
                ventaSubtotal={statement.ventaSubtotal}
                total={statement.amount}
              />
            ) : (
              <StatementPaymentsTab
                payments={statement.payments}
                blocked={paymentsBlocked}
              />
            )}
          </Box>
        </Stack>
      )}
    </SideModal>
  );
}
