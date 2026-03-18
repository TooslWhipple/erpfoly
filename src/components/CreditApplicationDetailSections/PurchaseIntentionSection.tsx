import { Divider, Grid, Stack, Typography } from "@mui/material";
import { ProductCard, ProductImage, SummaryRow } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

interface PurchaseIntentionSectionProps {
  detail: CreditApplicationDetail;
}

export function PurchaseIntentionSection({ detail }: PurchaseIntentionSectionProps) {
  const { purchaseIntention } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Intención de compra</Typography>
        <Typography variant="body2" color="text.secondary">
          Artículos que el solicitante desea comprar con su nuevo crédito.
        </Typography>
      </Stack>
      <Divider />
      <Stack spacing={2}>
        {
          purchaseIntention.items.map((item, index) => (
            <ProductCard key={`product-${index + 1}`}>
              <Stack spacing={1.5} direction="row" alignItems="center">
                <ProductImage src={item.imageUrl} alt={item.name} />
                <Stack>
                  <Typography variant="caption" color="text.secondary">Código: {item.code}</Typography>
                  <Typography variant="subtitle2" fontWeight={600}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.brand}</Typography>
                </Stack>
              </Stack>
              <Grid container spacing={1} paddingLeft="76px">
                <Grid size={{ xs: 6, sm: 3, md: 'grow' }}>
                  <Typography variant="body2" color="text.secondary">Cantidad</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.quantity}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 'grow' }}>
                  <Typography variant="body2" color="text.secondary">Precio individual</Typography>
                  <Typography variant="body2" fontWeight={600}>${formatCurrency(item.unitPrice)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 'grow' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>${formatCurrency(item.subtotal)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 'grow' }}>
                  <Typography variant="body2" color="text.secondary">Promoción</Typography>
                  <Typography variant="body2" fontWeight={600} color="error">-${formatCurrency(item.promotionDiscount)}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3, md: 'grow' }}>
                  <Typography variant="body2" color="text.secondary">Total</Typography>
                  <Typography variant="body2" fontWeight={600}>${formatCurrency(item.total)}</Typography>
                </Grid>
              </Grid>
            </ProductCard>
          ))
        }
      </Stack>
      <Stack>
        <SummaryRow withBackground={false}>
          <Typography variant="body1">Subtotal</Typography>
          <Typography variant="body1" fontWeight={600}>${formatCurrency(purchaseIntention.subtotal)}</Typography>
        </SummaryRow>
        <SummaryRow>
          <Typography variant="body1">Total</Typography>
          <Typography variant="subtitle1" fontWeight={600}>${formatCurrency(purchaseIntention.total)}</Typography>
        </SummaryRow>
      </Stack>
    </Stack >
  );
}
