import { Stack, Switch, Typography, Skeleton } from "@mui/material";
import type { SalesBranchConfig } from "@/types/inventario.types";
import {
    ConfigSectionTitle,
    ConfigSectionSubtitle,
    SalesBranchList,
    SalesBranchCard,
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
            <Stack spacing={2}>
                <Skeleton variant="text" width={220} height={28} animation="wave" />
                <Skeleton variant="text" width="80%" height={20} animation="wave" />
                <SalesBranchList>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={56}
                            sx={{ borderRadius: 2 }}
                            animation="wave"
                        />
                    ))}
                </SalesBranchList>
            </Stack>
        );
    }

    return (
        <Stack spacing={2}>
            <ConfigSectionTitle>Sucursales de venta</ConfigSectionTitle>
            <ConfigSectionSubtitle>
                Selecciona en qué sucursales se puede vender este artículo
            </ConfigSectionSubtitle>

            {branches.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No hay sucursales configuradas.
                </Typography>
            ) : (
                <SalesBranchList>
                    {branches.map((branch) => (
                        <SalesBranchCard key={branch.id}>
                            <Typography variant="body1" fontWeight={500}>
                                {branch.name}
                            </Typography>
                            <Switch
                                checked={branch.enabled}
                                onChange={(_, checked) => onBranchToggle(branch.id, checked)}
                                color="primary"
                                size="medium"
                            />
                        </SalesBranchCard>
                    ))}
                </SalesBranchList>
            )}
        </Stack>
    );
}
