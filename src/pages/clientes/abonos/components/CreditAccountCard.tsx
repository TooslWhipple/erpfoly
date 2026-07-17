import { Checkbox, Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import type { ClientCreditAccount, InstallmentSelection } from "@/types/clientPayment.types";
import {
  InnerCard,
  GrayCard,
  InstallmentsTableWrapper,
  InstallmentsTable,
  PaymentDot,
} from "@/styles/clientes/abonos.styles";

export interface CreditAccountCardProps {
  account: ClientCreditAccount;
  selections: InstallmentSelection[];
  onToggleInstallment: (purchaseId: string, installmentId: string) => void;
  canToggleInstallment: (purchaseId: string, installmentId: string) => boolean;
  isInPreview: (purchaseId: string, installmentId: string) => boolean;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function getSelection(
  selections: InstallmentSelection[],
  purchaseId: string,
  installmentId: string,
): InstallmentSelection | undefined {
  return selections.find(
    (selection) => selection.purchaseId === purchaseId && selection.installmentId === installmentId,
  );
}

export function CreditAccountCardComponent({
  account,
  selections,
  onToggleInstallment,
  canToggleInstallment,
  isInPreview,
}: CreditAccountCardProps) {
  return (
    <InnerCard>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "flex-end" }}
        spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="body1" fontWeight={600}>{account.productName}</Typography>
          <Typography variant="body2" color="text.secondary">Comprado el {account.purchaseDateLabel}</Typography>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={0.5} alignItems="center">
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
                <th aria-label="Seleccionar" />
                <th>Pago</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Interes</th>
                <th>Total</th>
                <th>A pagar</th>
              </tr>
            </thead>
            <tbody>
              {
                account.pendingInstallments.map((installment) => {
                  const selection = getSelection(selections, account.id, installment.id);
                  const amountToPay = selection?.amountToPay ?? 0;
                  const isAllocated = amountToPay > 0;
                  const inPreview = isInPreview(account.id, installment.id);
                  const canToggle = canToggleInstallment(account.id, installment.id);

                  return (
                    <tr
                      key={installment.id}
                      style={
                        isAllocated
                          ? { backgroundColor: "rgba(25, 118, 210, 0.06)" }
                          : undefined
                      }
                    >
                      <td>
                        <Checkbox
                          size="small"
                          checked={isAllocated}
                          disabled={!inPreview || !canToggle}
                          onChange={() =>
                            onToggleInstallment(account.id, installment.id)
                          }
                        />
                      </td>
                      <td style={isAllocated ? { fontWeight: 600 } : undefined}>
                        {installment.installmentNumber} de {installment.totalInstallments}
                      </td>
                      <td>{installment.dueDate}</td>
                      <td>{formatCurrency(installment.principalAmount)}</td>
                      <td>{formatCurrency(installment.interestAmount)}</td>
                      <td>{formatCurrency(installment.totalAmount)}</td>
                      <td style={isAllocated ? { fontWeight: 700 } : undefined}>
                        {isAllocated ? formatCurrency(amountToPay) : "$0.00"}
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
