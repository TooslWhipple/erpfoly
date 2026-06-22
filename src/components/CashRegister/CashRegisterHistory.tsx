import { Divider, Stack, Table, TableBody, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import numeral from "numeral";
import { Breadcrumbs } from "@/components";
import {
  TableCell,
  TableHeaderCell,
  HistoryTableCard
} from "@/styles/cajas.styles";
import { MovementTypeCell } from "./MovementTypeCell";
import { PaymentFormCell } from "./PaymentFormCell";
import type { CashRegisterHistoryProps } from "./types";
import { formatDate } from "@/utils/date";

export function CashRegisterHistory({ movements, onBack }: CashRegisterHistoryProps) {

  return (
    <>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Breadcrumbs items={[]} onBack={onBack} />
        <Typography variant="h4">Historial de actividad de la caja</Typography>
      </Stack>
      <Divider />

      <HistoryTableCard>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Hora</TableHeaderCell>
                <TableHeaderCell>Tipo</TableHeaderCell>
                <TableHeaderCell>Forma</TableHeaderCell>
                <TableHeaderCell>Usuario</TableHeaderCell>
                <TableHeaderCell>Monto</TableHeaderCell>
              </TableRow>
            </TableHead>
            {movements.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                Sin actividad aún
              </Typography>
            ) : (
              <TableBody>
                {movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{formatDate(movement.created_at, "HH:mm")}</TableCell>
                    <TableCell><MovementTypeCell type={movement.movement_type} /></TableCell>
                    <TableCell><PaymentFormCell paymentForm={movement.payment_form} /></TableCell>
                    <TableCell>{movement.created_by_name}</TableCell>
                    <TableCell>${numeral(movement.amount).format("0,0.00")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      </HistoryTableCard>
    </>
  );
}
