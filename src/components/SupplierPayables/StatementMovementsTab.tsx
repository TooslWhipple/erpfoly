import { Box, Link, Stack, Typography } from "@mui/material";
import numeral from "numeral";
import { DataTable } from "@/components/TableCrud";
import type { DataTableColumn } from "@/components/TableCrud";
import type { SupplierPayableMovement } from "@/types/supplier-payables.types";
import { formatDate } from "@/utils/date";
import { GrandTotalRow, SubtotalRow, TotalsFooter } from "./styles";

export interface StatementMovementsTabProps {
  movements: SupplierPayableMovement[];
  cargoSubtotal: number;
  ventaSubtotal: number;
  total: number;
}

export function StatementMovementsTab({
  movements,
  cargoSubtotal,
  ventaSubtotal,
  total,
}: StatementMovementsTabProps) {
  const columns: DataTableColumn<SupplierPayableMovement>[] = [
    {
      id: "date",
      label: "Fecha",
      format: (_value, row) => formatDate(row.date, "D [de] MMM, YYYY"),
    },
    {
      id: "concept",
      label: "Concepto",
      format: (_value, row) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={
            row.requiresAttention
              ? {
                  mx: -1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(211, 47, 47, 0.08)"
                      : "rgba(211, 47, 47, 0.2)",
                }
              : undefined
          }
        >
          {row.requiresAttention ? (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: "error.main",
                flexShrink: 0,
              }}
            />
          ) : null}
          <Typography variant="body2" component="span">
            {row.concept}
            {row.linkId ? (
              <>
                {" "}
                <Link component="button" type="button" underline="hover">
                  {row.linkId}
                </Link>
              </>
            ) : null}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "cargo",
      label: "Cargo",
      align: "right",
      format: (_value, row) =>
        row.cargo != null ? numeral(row.cargo).format("$0,0.00") : "",
    },
    {
      id: "venta",
      label: "Venta",
      align: "right",
      format: (_value, row) =>
        row.venta != null ? numeral(row.venta).format("$0,0.00") : "",
    },
  ];

  return (
    <Stack spacing={2}>
      <DataTable
        columns={columns}
        rows={movements}
        rowKey="id"
        emptyMessage="No hay movimientos"
      />

      <TotalsFooter>
        <SubtotalRow>
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body2" textAlign="right">
            {numeral(cargoSubtotal).format("$0,0.00")}
          </Typography>
          <Typography variant="body2" textAlign="right">
            {numeral(ventaSubtotal).format("$0,0.00")}
          </Typography>
        </SubtotalRow>
        <GrandTotalRow>
          <Typography variant="subtitle2">Total</Typography>
          <Typography variant="subtitle2" />
          <Typography variant="subtitle2" textAlign="right">
            {numeral(total).format("$0,0.00")}
          </Typography>
        </GrandTotalRow>
      </TotalsFooter>
    </Stack>
  );
}
