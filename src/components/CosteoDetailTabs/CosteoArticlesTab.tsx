import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Package } from "lucide-react";
import numeral from "numeral";
import { NumberInput } from "@/components/Folypuntos";
import type { CosteoArticle } from "@/types/costeos.types";
import {
  ContentCard,
  NAME_COLUMN_MAX_WIDTH,
  NameCellText,
  ProductThumb,
} from "@/styles/costeos/detail.styles";

interface CosteoArticlesTabProps {
  articles: CosteoArticle[];
  onReceivedChange: (articleId: string, received: number) => void;
}

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

export function CosteoArticlesTab({
  articles,
  onReceivedChange,
}: CosteoArticlesTabProps) {
  if (articles.length === 0) {
    return (
      <ContentCard>
        <Typography variant="body2" color="text.secondary">
          No hay artículos en este costeo
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
              <TableCell align="right">Costo Neto</TableCell>
              <TableCell align="right">Importe Neto</TableCell>
              <TableCell align="right">Costo Unitario</TableCell>
              <TableCell align="right">Costo Total</TableCell>
              <TableCell align="right">Cantidad</TableCell>
              <TableCell align="center">Recibidos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              articles.map((article) => (
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
                  <TableCell align="right">
                    {formatCurrency(article.netCost)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(article.netAmount)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(article.unitCost)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(article.totalCost)}
                  </TableCell>
                  <TableCell align="right">{article.quantity}</TableCell>
                  <TableCell align="center">
                    <Stack alignItems="center">
                      <NumberInput
                        value={article.received}
                        min={0}
                        max={article.quantity}
                        size="small"
                        width={96}
                        onChange={(value) =>
                          onReceivedChange(article.id, value)
                        }
                      />
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
      </div>
    </ContentCard>
  );
}
