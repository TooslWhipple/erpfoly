import { Checkbox, FormControlLabel, Grid, IconButton, Stack, Typography } from "@mui/material";
import { KeyboardArrowUp, KeyboardArrowDown } from "@mui/icons-material";
import numeral from "numeral";
import type { ClientCreditAccount } from "@/types/clientPayment.types";
import type { CascadeInstallmentPreview } from "@/utils/cascadePayment";
import { StatusChip } from "@/components/StatusChip/StatusChip";
import {
  InnerCard,
  GrayCard,
  InstallmentsTableWrapper,
  InstallmentsTable,
  PaymentDot,
} from "@/styles/clientes/abonos.styles";

export interface CreditAccountCardProps {
  account: ClientCreditAccount;
  cascadePreview: CascadeInstallmentPreview[];
  excludedFromCascade: boolean;
  onToggleExcluded: (purchaseId: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: (purchaseId: string) => void;
  onMoveDown: (purchaseId: string) => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function getCascadeResult(
  cascadePreview: CascadeInstallmentPreview[],
  purchaseId: string,
  installmentId: string,
): CascadeInstallmentPreview | undefined {
  return cascadePreview.find(
    (preview) => preview.purchaseId === purchaseId && preview.installmentId === installmentId,
  );
}

export function CreditAccountCardComponent({
  account,
  cascadePreview,
  excludedFromCascade,
  onToggleExcluded,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: CreditAccountCardProps) {
  return (
    <InnerCard sx={excludedFromCascade ? { opacity: 0.5 } : undefined}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="body1" fontWeight={600}>{account.productName}</Typography>
          <Typography variant="body2" color="text.secondary">Comprado el {account.purchaseDateLabel}</Typography>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1} alignItems="center">
          <Stack direction="row" spacing={0} alignItems="center">
            <IconButton
              size="small"
              aria-label="Mover antes en la cascada"
              disabled={!canMoveUp}
              onClick={() => onMoveUp(account.id)}>
              <KeyboardArrowUp fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              aria-label="Mover después en la cascada"
              disabled={!canMoveDown}
              onClick={() => onMoveDown(account.id)}>
              <KeyboardArrowDown fontSize="small" />
            </IconButton>
          </Stack>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={!excludedFromCascade}
                onChange={() => onToggleExcluded(account.id)}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Incluir en este abono
              </Typography>
            }
          />
          <Stack direction="row" spacing={0.25}>
            {
              Array.from({ length: account.totalInstallments }).map((_, index) => (
                <PaymentDot key={index} active={index < account.paidInstallments} />
              ))
            }
          </Stack>
          <Typography variant="body2" color="text.secondary">{account.paidInstallments} de {account.totalInstallments} pagos</Typography>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size='auto'>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Costo inicial</Typography>
            <Typography variant="body1">{formatCurrency(account.initialCost)}</Typography>
          </Stack>
        </Grid>
        <Grid size='auto'>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Total abonos</Typography>
            <Typography variant="body1">{formatCurrency(account.totalPaid)}</Typography>
          </Stack>
        </Grid>
        <Grid size='auto'>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Resta</Typography>
            <Typography variant="body1">{formatCurrency(account.remaining)}</Typography>
          </Stack>
        </Grid>
        <Grid size='auto'>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Fecha de pago</Typography>
            <Typography
              variant="body1"
              color={account.highlightPaymentDueDate ? "error.main" : "text.primary"}>{account.paymentDueDate}</Typography>
          </Stack>
        </Grid>
        <Grid size='auto'>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>Próx. Pago</Typography>
            <Typography variant="body1" fontWeight={700}>
              {formatCurrency(account.nextPaymentAmount)}
              {account.nextPaymentBreakdown ? ` ${account.nextPaymentBreakdown}` : ""}
            </Typography>
          </Stack>
        </Grid>
      </Grid>

      <GrayCard>
        <Typography variant="body2" color="text.secondary">Siguientes parcialidades pendientes</Typography>

        <InstallmentsTableWrapper>
          <InstallmentsTable>
            <thead>
              <tr>
                <th>Pago</th>
                <th>Fecha</th>
                <th>Mora</th>
                <th>Total</th>
                <th>Resultado de este abono</th>
              </tr>
            </thead>
            <tbody>
              {
                account.pendingInstallments.map((installment) => {
                  const cascadeResult = getCascadeResult(cascadePreview, account.id, installment.id);

                  return (
                    <tr key={installment.id}>
                      <td>{installment.installmentNumber} de {installment.totalInstallments}</td>
                      <td>{installment.dueDate}</td>
                      <td>{formatCurrency(installment.overdueAmount)}</td>
                      <td>{formatCurrency(installment.totalAmount)}</td>
                      <td>
                        {cascadeResult ? (
                          <StatusChip
                            size="small"
                            variant={cascadeResult.fullyCovered ? "success" : "warning"}
                            label={
                              cascadeResult.fullyCovered
                                ? `Se cubre (${formatCurrency(cascadeResult.amountApplied)})`
                                : `Abono parcial (${formatCurrency(cascadeResult.amountApplied)})`
                            }
                          />
                        ) : (
                          <StatusChip size="small" variant="disabled" label="Sin abono" />
                        )}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </InstallmentsTable>
        </InstallmentsTableWrapper>
      </GrayCard>
    </InnerCard >
  );
}

const CreditAccountCardPage = () => null;

export default CreditAccountCardPage;
