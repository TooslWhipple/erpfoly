import { Checkbox, Grid, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import type { ClientCreditAccount, InstallmentSelection } from "@/types/clientPayment.types";
import {
  InnerCard,
  GrayCard,
  InstallmentsTableWrapper,
  InstallmentsTable,
  AmountInput,
  PaymentDot,
} from "@/styles/clientes/abonos.styles";

export interface CreditAccountCardProps {
  account: ClientCreditAccount;
  selections: InstallmentSelection[];
  canSelectInstallment: (purchaseId: string, installmentId: string) => boolean;
  canEditAmount: (purchaseId: string, installmentId: string) => boolean;
  onToggleInstallment: (purchaseId: string, installmentId: string) => void;
  onAmountChange: (purchaseId: string, installmentId: string, amount: number) => void;
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
  canSelectInstallment,
  canEditAmount,
  onToggleInstallment,
  onAmountChange,
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
        <Typography variant="body2" color="text.secondary">
          Parcialidades pendientes (selección en orden, sin saltos)
        </Typography>

        <InstallmentsTableWrapper>
          <InstallmentsTable>
            <thead>
              <tr>
                <th aria-label="Seleccionar" />
                <th>Pago</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>IVA</th>
                <th>Pendiente</th>
                <th>A pagar</th>
              </tr>
            </thead>
            <tbody>
              {
                account.pendingInstallments.map((installment) => {
                  const selection = getSelection(selections, account.id, installment.id);
                  const amountToPay = selection?.amountToPay ?? 0;
                  const isSelected = selection?.selected ?? false;
                  const interactive = canSelectInstallment(account.id, installment.id);
                  const amountEditable = canEditAmount(account.id, installment.id);
                  const inputValue = isSelected
                    ? String(amountToPay > 0 ? amountToPay : "")
                    : "";

                  return (
                    <tr key={installment.id}>
                      <td>
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          disabled={!interactive}
                          onChange={() => onToggleInstallment(account.id, installment.id)}
                        />
                      </td>
                      <td>{installment.installmentNumber} de {installment.totalInstallments}</td>
                      <td>{installment.dueDate}</td>
                      <td>{formatCurrency(installment.principalAmount)}</td>
                      <td>{formatCurrency(installment.ivaAmount)}</td>
                      <td>{formatCurrency(installment.totalAmount)}</td>
                      <td>
                        <AmountInput
                          size="small"
                          value={inputValue}
                          placeholder="0.00"
                          disabled={!amountEditable}
                          onChange={(event) => {
                            const raw = event.target.value.replace(/[^0-9.]/g, "");
                            const parts = raw.split(".");
                            const sanitized = parts.length > 2
                              ? `${parts[0]}.${parts.slice(1).join("")}`
                              : raw;
                            const parsed = parseFloat(sanitized);
                            onAmountChange(
                              account.id,
                              installment.id,
                              Number.isNaN(parsed) ? 0 : parsed,
                            );
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </InstallmentsTable>
        </InstallmentsTableWrapper>
      </GrayCard>
    </InnerCard>
  );
}

const CreditAccountCardPage = () => null;

export default CreditAccountCardPage;
