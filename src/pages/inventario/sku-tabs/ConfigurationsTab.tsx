import { Button, Stack, Switch, Typography, Skeleton } from "@mui/material";
import type { SalesBranchConfig } from "@/types/inventario.types";
import {
    CardContainer,
    BranchCard,
} from "@/styles/inventario/detalle.styles";

export interface ConfigurationsTabProps {
    branches: SalesBranchConfig[];
    loading: boolean;
    savingBranchIds?: string[];
    onBranchToggle: (branchId: string, enabled: boolean) => void;
    onToggleAll?: () => void;
}

export function ConfigurationsTab({
    branches,
    loading,
    savingBranchIds = [],
    onBranchToggle,
    onToggleAll,
}: ConfigurationsTabProps) {
    const areAllEnabled =
        branches.length > 0 && branches.every((branch) => branch.enabled);
    const isSavingAny = savingBranchIds.length > 0;

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
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                spacing={2}
            >
                <Stack>
                    <Typography variant="h5" fontWeight={600}>
                        Sucursales de venta
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Selecciona en qué sucursales se puede vender este artículo
                    </Typography>
                </Stack>
                {branches.length > 0 && onToggleAll != null && (
                    <Button
                        variant="text"
                        size="small"
                        onClick={onToggleAll}
                        disabled={isSavingAny}
                    >
                        {areAllEnabled ? "Quitar todas" : "Seleccionar todas"}
                    </Button>
                )}
            </Stack>

            {branches.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No hay sucursales configuradas.
                </Typography>
            ) : (
                <Stack spacing={1.5}>
                    {branches.map((branch) => {
                        const isSaving = savingBranchIds.includes(branch.id);
                        return (
                            <BranchCard key={branch.id}>
                                <Switch
                                    checked={branch.enabled}
                                    onChange={(_, checked) =>
                                        onBranchToggle(branch.id, checked)
                                    }
                                    color="primary"
                                    size="medium"
                                    disabled={isSaving || isSavingAny}
                                />
                                <Typography variant="body1">{branch.name}</Typography>
                            </BranchCard>
                        );
                    })}
                </Stack>
            )}
        </CardContainer>
    );
}

const SkuConfigurationsTabPage = () => null;

export default SkuConfigurationsTabPage;
