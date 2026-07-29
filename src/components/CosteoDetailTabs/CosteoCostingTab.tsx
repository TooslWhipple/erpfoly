import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Package } from "lucide-react";
import numeral from "numeral";
import type { CosteoArticle } from "@/types/costeos.types";
import {
  ContentCard,
  NAME_COLUMN_MAX_WIDTH,
  NameCellText,
  ProductThumb,
} from "@/styles/costeos/detail.styles";

interface CosteoCostingTabProps {
  articles: CosteoArticle[];
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function CosteoCostingTab({ articles }: CosteoCostingTabProps) {
  if (articles.length === 0) {
    return (
      <ContentCard>
        <Typography variant="body2" color="text.secondary">
          No hay datos de costeo
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
              <TableCell width={48} />
              <TableCell sx={{ maxWidth: NAME_COLUMN_MAX_WIDTH, width: NAME_COLUMN_MAX_WIDTH }}>
                Nombre
              </TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Pedido</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="right">Costo Dlls</TableCell>
              <TableCell align="right">Importe Dlls</TableCell>
              <TableCell align="right">Costo Pesos</TableCell>
              <TableCell align="right">Importe Pesos</TableCell>
              <TableCell align="right">Gastos Pesos</TableCell>
              <TableCell align="right">Costo Unitario</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id} hover>
                <TableCell>
                  <ProductThumb>
                    <Package size={16} />
                  </ProductThumb>
                </TableCell>
                <TableCell
                  sx={{ maxWidth: NAME_COLUMN_MAX_WIDTH, width: NAME_COLUMN_MAX_WIDTH }}
                >
                  <NameCellText variant="body2" title={article.name}>
                    {article.name}
                  </NameCellText>
                </TableCell>
                <TableCell>{article.sku}</TableCell>
                <TableCell>{article.orderNumber}</TableCell>
                <TableCell align="right">{article.quantity}</TableCell>
                <TableCell align="right">
                  {formatCurrency(article.costUsd)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(article.amountUsd)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(article.costMxn)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(article.amountMxn)}
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(article.expensesMxn)}
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(article.finalUnitCost)}
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
