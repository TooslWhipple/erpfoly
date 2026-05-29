import { Grid, Stack, Typography } from "@mui/material";
import type { ClientPurchaseInfo } from "@/types/clientPurchase.types";
import { ContentCard, ReadOnlyField } from "@/styles/clientes/compra-detalle.styles";

export interface PurchaseDataTabProps {
  purchaseInfo: ClientPurchaseInfo;
}

interface ReadOnlyFieldItemProps {
  label: string;
  value: string;
}

function ReadOnlyFieldItem({ label, value }: ReadOnlyFieldItemProps) {
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <ReadOnlyField>{value}</ReadOnlyField>
    </Stack>
  );
}

export function PurchaseDataTab({ purchaseInfo }: PurchaseDataTabProps) {
  return (
    <ContentCard>
      <Stack spacing={0.5}>
        <Typography variant="h6">Información de la compra</Typography>
        <Typography variant="body2" color="text.secondary">
          Información básica sobre el cliente
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ReadOnlyFieldItem label="Fecha de compra" value={purchaseInfo.purchaseDate} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ReadOnlyFieldItem label="Fecha de entrega" value={purchaseInfo.deliveryDate} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ReadOnlyFieldItem
            label="Sucursal dónde se realizó la compra"
            value={purchaseInfo.purchaseBranch}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ReadOnlyFieldItem
            label="Sucursal dónde se realizará la entrega"
            value={purchaseInfo.deliveryBranch}
          />
        </Grid>
      </Grid>
    </ContentCard>
  );
}

const PurchaseDataTabPage = () => null;

export default PurchaseDataTabPage;
