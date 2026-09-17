import { Table, TableBody, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import numeral from "numeral";
import {
  TableCell,
  TableHeaderCell,
  HistoryTableCard,
} from "@/styles/cajas.styles";
import { MovementTypeCell } from "./MovementTypeCell";
import { PaymentFormCell } from "./PaymentFormCell";
import type { CashRegisterHistoryProps } from "./types";
import { formatDate } from "@/utils/date";

export function CashRegisterHistory({ movements }: CashRegisterHistoryProps) {
  return (
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
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    Sin actividad aún
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell>{formatDate(movement.created_at, "HH:mm")}</TableCell>
                  <TableCell>
                    <MovementTypeCell type={movement.movement_type} />
                  </TableCell>
                  <TableCell>
                    <PaymentFormCell paymentForm={movement.payment_form} />
                  </TableCell>
                  <TableCell>{movement.created_by_name}</TableCell>
                  <TableCell>
                    ${numeral(movement.amount).format("0,0.00")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </HistoryTableCard>
  );
}
