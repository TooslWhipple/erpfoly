import { Stack, Typography } from "@mui/material";
import { HandoverReceiptsList } from "@/components/SaleHandoverPanel";
import { ContentCard } from "@/styles/clientes/compra-detalle.styles";

export interface PurchaseHandoversTabProps {
  saleId: number;
}

export function PurchaseHandoversTab({ saleId }: PurchaseHandoversTabProps) {
  return (
    <ContentCard>
      <Stack spacing={0.5}>
        <Typography variant="h6">Comprobantes de entrega</Typography>
        <Typography variant="body2" color="text.secondary">
          Cada entrega en sucursal con su comprobante.
        </Typography>
      </Stack>
      <HandoverReceiptsList saleId={saleId} />
    </ContentCard>
  );
}

const PurchaseHandoversTabPage = () => null;

export default PurchaseHandoversTabPage;
