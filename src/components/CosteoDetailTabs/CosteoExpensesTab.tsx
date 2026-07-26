import {
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Minus, Trash } from "lucide-react";
import numeral from "numeral";
import type { CosteoExpense, CosteoExpenseSummary } from "@/types/costeos.types";
import {
  ContentCard,
  NAME_COLUMN_MAX_WIDTH,
  NameCellText,
  SummaryCard,
} from "@/styles/costeos/detail.styles";

interface CosteoExpensesTabProps {
  expenses: CosteoExpense[];
  summary: CosteoExpenseSummary;
  affectArticlePrices: boolean;
  onAffectPricesChange: (checked: boolean) => void;
  onRemoveExpense: (expenseId: number) => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function CosteoExpensesTab({
  expenses,
  summary,
  affectArticlePrices,
  onAffectPricesChange,
  onRemoveExpense,
}: CosteoExpensesTabProps) {
  return (
    <Stack spacing={2}>
      <ContentCard>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Switch
            checked={affectArticlePrices}
            onChange={(_, checked) => onAffectPricesChange(checked)}
            color="primary"
          />
          <Typography variant="body2" color={(affectArticlePrices) ? "primary.main" : "text.primary"}>Afectar precios de artículos.</Typography>
        </Stack>
      </ContentCard>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <ContentCard>
            {expenses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay gastos registrados
              </Typography>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ width: "224px" }}>Gasto</TableCell>
                      <TableCell style={{ width: "96px" }}>Moneda</TableCell>
                      <TableCell style={{ width: "176px" }} align="right">Tipo de cambio</TableCell>
                      <TableCell style={{ width: "176px" }} align="right">Monto</TableCell>
                      <TableCell style={{ width: "176px" }} align="right">Subtotal</TableCell>
                      <TableCell style={{ width: "176px" }} align="right" > IVA</TableCell>
                      <TableCell style={{ width: "176px" }} align="right">Total</TableCell>
                      <TableCell style={{ width: "48px" }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} hover>
                        <TableCell>
                          <NameCellText variant="body2" fontWeight={500} title={expense.name}>
                            {expense.name}
                          </NameCellText>
                        </TableCell>
                        <TableCell>{expense.currency}</TableCell>
                        <TableCell align="right">{formatCurrency(expense.exchangeRate)}</TableCell>
                        <TableCell align="right">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell align="right">{formatCurrency(expense.subtotal)}</TableCell>
                        <TableCell align="right">{formatCurrency(expense.vat)}</TableCell>
                        <TableCell align="right">{formatCurrency(expense.total)}</TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            aria-label="Eliminar gasto"
                            onClick={() => onRemoveExpense(expense.id)}>
                            <Trash size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </ContentCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }}>
          <SummaryCard>
            <Typography variant="subtitle1" fontWeight={600} mb={2}>
              Resumen de gastos
            </Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Subtotal
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(summary.subtotal)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  IVA
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(summary.vat)}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" fontWeight={600}>
                  Total
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {formatCurrency(summary.total)}
                </Typography>
              </Stack>
            </Stack>
          </SummaryCard>
        </Grid>
      </Grid>
    </Stack >
  );
}
