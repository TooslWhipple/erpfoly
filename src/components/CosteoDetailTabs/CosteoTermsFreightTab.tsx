import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import type { CosteoTermFreight } from "@/types/costeos.types";
import { ContentCard } from "@/styles/costeos/detail.styles";

interface CosteoTermsFreightTabProps {
  terms: CosteoTermFreight[];
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function CosteoTermsFreightTab({ terms }: CosteoTermsFreightTabProps) {
  if (terms.length === 0) {
    return (
      <ContentCard>
        <Typography variant="body2" color="text.secondary">
          No hay plazos ni fletes registrados
        </Typography>
      </ContentCard>
    );
  }

  return (
    <ContentCard>
      <div style={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Concepto</TableCell>
              <TableCell align="right">Plazo (días)</TableCell>
              <TableCell>Tipo de flete</TableCell>
              <TableCell align="right">Monto</TableCell>
              <TableCell>Notas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {terms.map((term) => (
              <TableRow key={term.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {term.concept}
                  </Typography>
                </TableCell>
                <TableCell align="right">{term.termDays}</TableCell>
                <TableCell>{term.freightType}</TableCell>
                <TableCell align="right">
                  {formatCurrency(term.amount)}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {term.notes}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ContentCard>
  );
}
