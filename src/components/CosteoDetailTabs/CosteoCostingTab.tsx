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
import { mxnToUsd } from "@/lib/costeo/allocateExpenses";
import type { CosteoArticle } from "@/types/costeos.types";
import {
  ContentCard,
  NAME_COLUMN_MAX_WIDTH,
  NameCellText,
  ProductThumb,
} from "@/styles/costeos/detail.styles";

interface CosteoCostingTabProps {
  articles: CosteoArticle[];
  exchangeRate: number;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function CosteoCostingTab({ articles, exchangeRate }: CosteoCostingTabProps) {
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
              <TableCell align="right">Costo Unitario Dlls</TableCell>
              <TableCell align="right">Costo Unitario Pesos</TableCell>
              <TableCell align="right">Importe Dlls</TableCell>
              <TableCell align="right">Importe Pesos</TableCell>
              <TableCell align="right">Gastos</TableCell>
              <TableCell align="right">Costo Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articles.map((article) => {
              const costMxn =
                Number.isFinite(article.costMxn) && article.costMxn > 0
                  ? article.costMxn
                  : article.unitCost;
              const amountMxn =
                Number.isFinite(article.amountMxn) && article.amountMxn > 0
                  ? article.amountMxn
                  : article.totalCost;
              const costUsd = mxnToUsd(costMxn, exchangeRate);
              const amountUsd = mxnToUsd(amountMxn, exchangeRate);
              const totalCost =
                article.quantity > 0
                  ? article.finalUnitCost * article.quantity
                  : article.finalUnitCost;
              return (
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
                    {formatCurrency(costUsd)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(costMxn)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(amountUsd)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(amountMxn)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(article.expensesMxn)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(totalCost)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ContentCard>
  );
}
