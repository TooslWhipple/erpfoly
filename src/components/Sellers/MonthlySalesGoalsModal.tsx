import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import { colors } from "@/styles/theme";
import type { SellerMonthlyBreakdownRow } from "@/types/sellers.types";

export interface MonthlySalesGoalsModalProps {
  open: boolean;
  onClose: () => void;
  rows: SellerMonthlyBreakdownRow[];
}

export function MonthlySalesGoalsModal({ open, onClose, rows }: MonthlySalesGoalsModalProps) {
  return (
    <SideModal
      open={open}
      onClose={onClose}
      maxWidth="xl"
      header={
        <Typography variant="h2" component="h2">
          Ventas y metas por mes
        </Typography>
      }
      contentSx={{ overflowX: "auto" }}
    >
      <Table size="small" sx={{ borderCollapse: "separate", minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: "text.secondary", borderBottomColor: colors.border, fontWeight: 500 }}>
              Código
            </TableCell>
            <TableCell sx={{ color: "text.secondary", borderBottomColor: colors.border, fontWeight: 500 }}>
              Venta
            </TableCell>
            <TableCell sx={{ color: "text.secondary", borderBottomColor: colors.border, fontWeight: 500 }}>
              Meta
            </TableCell>
            <TableCell sx={{ color: "text.secondary", borderBottomColor: colors.border, fontWeight: 500 }}>
              Variación vs Meta
            </TableCell>
            <TableCell sx={{ color: "text.secondary", borderBottomColor: colors.border, fontWeight: 500 }}>
              Año anterior
            </TableCell>
            <TableCell sx={{ color: "text.secondary", borderBottomColor: colors.border, fontWeight: 500 }}>
              Variación vs año anterior
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.monthIndex}>
              <TableCell
                sx={{
                  color: "text.secondary",
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {row.monthLabel}
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${colors.border}` }}>
                {numeral(row.salesAmount).format("$0,0.00")}
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${colors.border}` }}>
                {numeral(row.goalAmount).format("$0,0.00")}
              </TableCell>
              <TableCell
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {row.variationVsGoalPercent}%
              </TableCell>
              <TableCell sx={{ borderBottom: `1px solid ${colors.border}` }}>
                {numeral(row.priorYearSalesAmount).format("$0,0.00")}
              </TableCell>
              <TableCell
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                {row.variationVsPriorYearPercent}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SideModal>
  );
}
