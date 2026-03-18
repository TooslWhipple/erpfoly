import { Divider, Stack, Typography } from "@mui/material";
import { ProductRow, ProductImage, SummaryRow } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { colors } from "@/styles/theme";

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
        {purchaseIntention.items.map((item, index) => (
          <ProductRow key={index} style={{ marginBottom: 0 }}>
            <ProductImage src={item.imageUrl} alt={item.name} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Código: {item.code}
              </Typography>
              <Typography variant="subtitle2" fontWeight={600}>
                {item.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.brand}
              </Typography>
              <table style={{ width: "100%", marginTop: 8, fontSize: 13 }}>
                <tbody>
                  <tr>
                    <td>Cantidad</td>
                    <td>{item.quantity}</td>
                  </tr>
                  <tr>
                    <td>Precio individual</td>
                    <td>${formatCurrency(item.unitPrice)}</td>
                  </tr>
                  <tr>
                    <td>Subtotal</td>
                    <td>${formatCurrency(item.subtotal)}</td>
                  </tr>
                  <tr>
                    <td>Promoción</td>
                    <td style={{ color: colors.chip.variants.error.color }}>
                      -${formatCurrency(item.promotionDiscount)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Total</strong>
                    </td>
                    <td>
                      <strong>${formatCurrency(item.total)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </ProductRow>
        ))}
      </Stack>
      <SummaryRow>
        <Typography variant="body2">Subtotal</Typography>
        <Typography variant="body2" fontWeight={600}>
          ${formatCurrency(purchaseIntention.subtotal)}
        </Typography>
      </SummaryRow>
      <SummaryRow>
        <Typography variant="body2" fontWeight={600}>
          Total
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          ${formatCurrency(purchaseIntention.total)}
        </Typography>
      </SummaryRow>
    </Stack>
  );
}
