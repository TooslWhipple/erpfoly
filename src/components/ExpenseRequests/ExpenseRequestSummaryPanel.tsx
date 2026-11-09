import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import type {
  ExpenseRequestClassification,
  ExpenseRequestDetail,
  ExpenseRequestStatus,
} from "@/types/expense-requests.types";
import {
  EXPENSE_REQUEST_CLASSIFICATION_LABELS,
  EXPENSE_REQUEST_STATUS_LABELS,
} from "@/types/expense-requests.types";
import { ExpenseRequestProgressBars } from "./ExpenseRequestProgressBars";
import {
  SummaryCard,
  SummaryPanel,
  SummaryTitle,
} from "@/styles/facturas/registerExpense.styles";
import { formatDate } from "@/utils/date";

export interface ExpenseRequestSummaryPanelProps {
  request?: ExpenseRequestDetail | null;
  temporaryValues?: {
    classification?: ExpenseRequestClassification;
    requestedAmount?: number;
    destination?: string;
    startDate?: string;
    endDate?: string;
  };
}

const STATUS_COLOR_MAP: Record<
  ExpenseRequestStatus,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  DRAFT: "default",
  PENDING_APPROVAL: "warning",
  APPROVED: "info",
  IN_COMPROBATION: "secondary",
  IN_VERIFICATION: "warning",
  COMPLETED: "success",
  REJECTED: "error",
  CANCELLED: "error",
};

export function ExpenseRequestSummaryPanel({
  request,
  temporaryValues,
}: ExpenseRequestSummaryPanelProps) {
  const classification =
    request?.classification ?? temporaryValues?.classification ?? "VIATICOS";
  const requestedAmount =
    request?.requestedAmount ?? temporaryValues?.requestedAmount ?? 0;
  const verifiedAmount = request?.verifiedAmount ?? 0;
  const balance = Math.max(0, requestedAmount - verifiedAmount);
  const status = request?.status ?? "PENDING_APPROVAL";

  const startDate = request?.startDate ?? temporaryValues?.startDate;
  const endDate = request?.endDate ?? temporaryValues?.endDate;
  const destination = request?.destination ?? temporaryValues?.destination;

  return (
    <SummaryPanel>
      <SummaryCard>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
        >
          <SummaryTitle>Resumen de Solicitud</SummaryTitle>
          <Chip
            size="small"
            label={EXPENSE_REQUEST_STATUS_LABELS[status]}
            color={STATUS_COLOR_MAP[status]}
            variant="filled"
          />
        </Stack>

        {request?.folio && (
          <Typography variant="caption" color="text.secondary">
            Folio: <strong>{request.folio}</strong>
          </Typography>
        )}

        <Chip
          size="small"
          label={EXPENSE_REQUEST_CLASSIFICATION_LABELS[classification]}
          variant="outlined"
          sx={{ alignSelf: "flex-start" }}
        />

        <ExpenseRequestProgressBars
          requestedAmount={requestedAmount}
          verifiedAmount={verifiedAmount}
          stacked
        />

        <Divider sx={{ my: 0.5 }} />

        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Monto Solicitado:
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {numeral(requestedAmount).format("$0,0.00")}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Monto Comprobado:
            </Typography>
            <Typography variant="body2" fontWeight={600} color="primary.main">
              {numeral(verifiedAmount).format("$0,0.00")}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Saldo Restante:
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color={balance > 0 ? "warning.main" : "text.primary"}
            >
              {numeral(balance).format("$0,0.00")}
            </Typography>
          </Stack>

          {request?.reimbursedAmount != null && request.reimbursedAmount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                {classification === "CAJA_CHICA"
                  ? "Reposición a Caja:"
                  : "Monto Reembolsado:"}
              </Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {numeral(request.reimbursedAmount).format("$0,0.00")}
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 0.5 }} />

          {startDate && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Vigencia:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {formatDate(startDate, "DD/MM/YYYY")}
                {endDate && endDate !== startDate
                  ? ` al ${formatDate(endDate, "DD/MM/YYYY")}`
                  : ""}
              </Typography>
            </Stack>
          )}

          {request?.dispersionDate && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Fecha de dispersión:
              </Typography>
              <Typography variant="caption" fontWeight={600} color="primary.main">
                {formatDate(request.dispersionDate, "DD/MM/YYYY")}
              </Typography>
            </Stack>
          )}

          {(status === "APPROVED" ||
            status === "IN_COMPROBATION" ||
            status === "IN_VERIFICATION" ||
            status === "COMPLETED") && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Dispersión / Pago:
              </Typography>
              <Chip
                size="small"
                label={request?.dispersedAt ? "Pagado / Dispersado" : "Pendiente de dispersión"}
                color={request?.dispersedAt ? "success" : "warning"}
                variant="outlined"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
              />
            </Stack>
          )}

          {request?.reimbursementSchedule && (
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary">
                Devolución programada:
              </Typography>
              <Typography variant="caption" fontWeight={700} color="info.main">
                {formatDate(request.reimbursementSchedule.scheduledDate, "DD/MM/YYYY")} (
                {numeral(request.reimbursementSchedule.amount).format("$0,0.00")})
              </Typography>
            </Stack>
          )}

          {request?.paymentReference && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Referencia de pago:
              </Typography>
              <Typography
                variant="caption"
                fontWeight={600}
                color="success.main"
                sx={{ fontFamily: "monospace" }}
              >
                {request.paymentReference}
              </Typography>
            </Stack>
          )}

          {destination && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Destino:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {destination}
              </Typography>
            </Stack>
          )}

          {request?.debtor && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Empleado / Deudor:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {request.debtor.fullName}
              </Typography>
            </Stack>
          )}

          {request?.responsible && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Responsable:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {request.responsible.fullName}
              </Typography>
            </Stack>
          )}

          {request?.branch && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Sucursal:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {request.branch.name}
              </Typography>
            </Stack>
          )}

          {request?.category && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Categoría:
              </Typography>
              <Typography variant="caption" fontWeight={500}>
                {request.category.name}
              </Typography>
            </Stack>
          )}
        </Stack>
      </SummaryCard>
    </SummaryPanel>
  );
}

