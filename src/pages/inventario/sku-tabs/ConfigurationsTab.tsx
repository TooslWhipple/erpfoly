import { Stack, Switch, Typography, Skeleton } from "@mui/material";
import type { SalesBranchConfig } from "@/types/inventario.types";
import {
    CardContainer,
    BranchCard,
} from "@/styles/inventario/detalle.styles";

// ============================================================================
// TYPES
// ============================================================================

export interface ConfigurationsTabProps {
    branches: SalesBranchConfig[];
    loading: boolean;
    onBranchToggle: (branchId: string, enabled: boolean) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ConfigurationsTab({
    branches,
    loading,
    onBranchToggle,
}: ConfigurationsTabProps) {
    if (loading) {
        return (
            <CardContainer>
                <Stack>
                    <Skeleton variant="text" width={220} height={28} animation="wave" />
                    <Skeleton variant="text" width="80%" height={20} animation="wave" />
                </Stack>
                <Stack spacing={1.5}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={56}
                            sx={{ borderRadius: 2 }}
                            animation="wave"
                        />
                    ))}
                </Stack>
            </CardContainer>
        );
    }

    return (
        <CardContainer>
            <Stack>
                <Typography variant="h5" fontWeight={600}>Sucursales de venta</Typography>
                <Typography variant="body2" color="text.secondary">Selecciona en qué sucursales se puede vender este artículo</Typography>
            </Stack>

            {
                (branches.length === 0) ?
                    <Typography variant="body2" color="text.secondary">No hay sucursales configuradas.</Typography>
                    :
                    <Stack spacing={1.5}>
                        {
                            branches.map((branch) => (
                                <BranchCard key={branch.id}>
                                    <Switch
                                        checked={branch.enabled}
                                        onChange={(_, checked) => onBranchToggle(branch.id, checked)}
                                        color="primary"
                                        size="medium"
                                    />
                                    <Typography variant="body1">{branch.name}</Typography>
                                </BranchCard>
                            ))
                        }
                    </Stack>
            }
        </CardContainer>
    );
}

const SkuConfigurationsTabPage = () => null;

export default SkuConfigurationsTabPage;
