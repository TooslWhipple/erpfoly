import {
    GridView as GridViewIcon,
    Sync as SyncIcon,
    LocalShipping as ShippingIcon,
    Build as BuildIcon,
} from "@mui/icons-material";
import { Grid, Stack, Typography } from "@mui/material";
import { ProductInfoCard, InventoryByBranchTable } from "@/components/InventoryDetail";
import {
    SummaryCard,
    SummaryCardIcon,
} from "@/styles/inventario/detalle.styles";
import type { InventorySummary, BranchInventory } from "@/types/inventario.types";

export interface InventoryTabProps {
    summary: InventorySummary;
    branchInventory: BranchInventory[];
    loading: boolean;
}

export function InventoryTab({ summary, branchInventory, loading }: InventoryTabProps) {
    return (
        <Stack spacing={3}>
            <Grid container spacing={2} alignItems="stretch">
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SummaryCard>
                        <Typography variant="h5">En inventario</Typography>
                        <Typography variant="h3">{summary.inStock}</Typography>
                        <Typography variant="body2" color="text.secondary">Total en todas las sucursales.</Typography>
                        <SummaryCardIcon>
                            <GridViewIcon />
                        </SummaryCardIcon>
                    </SummaryCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SummaryCard>
                        <Typography variant="h5">Pedido</Typography>
                        <Typography variant="h3">{summary.orders}</Typography>
                        <Typography variant="body2" color="text.secondary">Artículos solicitados a proveedores.</Typography>
                        <SummaryCardIcon>
                            <SyncIcon />
                        </SummaryCardIcon>
                    </SummaryCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SummaryCard>
                        <Typography variant="h5">En tránsito</Typography>
                        <Typography variant="h3">{summary.inTransit}</Typography>
                        <Typography variant="body2" color="text.secondary">Artículos con pedido activo</Typography>
                        <SummaryCardIcon>
                            <ShippingIcon />
                        </SummaryCardIcon>
                    </SummaryCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                    <SummaryCard>
                        <Typography variant="h5">Mercancia dañada</Typography>
                        <Typography variant="h3">{summary.damaged}</Typography>
                        <Typography variant="body2" color="text.secondary">Requieren gestión especial</Typography>
                        <SummaryCardIcon>
                            <BuildIcon />
                        </SummaryCardIcon>
                    </SummaryCard>
                </Grid>
            </Grid>

            <ProductInfoCard
                title="Inventario por Sucursal"
                subtitle="Distribución de existencias en cada ubicación"
                showEditButton={false}
            >
                <InventoryByBranchTable data={branchInventory} loading={loading} />
            </ProductInfoCard>
        </Stack>
    );
}
