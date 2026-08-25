import { Button, Divider, IconButton, Stack, Switch, Typography } from "@mui/material";
import {
    FormCard,
    BranchItem,
    InventoryControl,
    InventoryInput,
} from "@/styles/catalogos/productos.styles";
import type { ProductBranch } from "@/types/productos.types";
import { ArrowDownToDot, ArrowUpFromDot, Minus, Plus } from "lucide-react";
import { theme } from "@/styles/theme";

interface BranchesTabProps {
    branches: ProductBranch[];
    onBranchToggle: (branchId: string) => void;
    onToggleAllBranches: () => void;
    onInventoryChange: (branchId: string, field: "minInventory" | "maxInventory", delta: number) => void;
    onInventoryInputChange: (branchId: string, field: "minInventory" | "maxInventory", value: string) => void;
    error?: string;
    readOnly?: boolean;
}

export function BranchesTab({
    branches,
    onBranchToggle,
    onToggleAllBranches,
    onInventoryChange,
    onInventoryInputChange,
    error,
    readOnly = false,
}: BranchesTabProps) {
    const areAllBranchesEnabled = branches.length > 0 && branches.every((branch) => branch.enabled);

    return (
        <FormCard>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack spacing={0.5}>
                    <Typography variant="h6">Sucursales de venta</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configura las sucursales en las cuales se puede vender este artículo y el mínimo y máximo de inventario permitido.
                    </Typography>
                </Stack>
                {branches.length > 0 && !readOnly && (
                    <Button variant="text" size="small" onClick={onToggleAllBranches}>
                        {areAllBranchesEnabled ? "Quitar todas" : "Seleccionar todas"}
                    </Button>
                )}
            </Stack>
            <Divider />
            {error && (
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            )}
            <Stack spacing={1.5}>
                {
                    branches.map((branch) => (
                        <BranchItem key={branch.id}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Switch
                                    checked={branch.enabled}
                                    onChange={() => onBranchToggle(branch.id)}
                                    color="primary"
                                    disabled={readOnly}
                                />
                                <Typography variant="body1">{branch.branchName}</Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={2}>
                                <InventoryControl>
                                    <ArrowDownToDot size={16} color={theme.palette.text.secondary} />
                                    <Typography variant="caption" fontWeight={500}>Min:</Typography>
                                    <IconButton
                                        size="small"
                                        disabled={readOnly}
                                        onClick={() => onInventoryChange(branch.id, "minInventory", -1)}>
                                        <Minus size={18} color={theme.palette.text.secondary} />
                                    </IconButton>
                                    <InventoryInput
                                        size="small"
                                        value={branch.minInventory}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            onInventoryInputChange(branch.id, "minInventory", e.target.value)
                                        }
                                        inputProps={{ style: { textAlign: "center" } }}
                                    />
                                    <IconButton
                                        size="small"
                                        disabled={readOnly}
                                        onClick={() => onInventoryChange(branch.id, "minInventory", 1)}
                                    >
                                        <Plus size={18} color={theme.palette.text.secondary} />
                                    </IconButton>
                                </InventoryControl>
                                <InventoryControl>
                                    <ArrowUpFromDot size={16} color={theme.palette.text.secondary} />
                                    <Typography variant="caption" fontWeight={500}>Max:</Typography>
                                    <IconButton
                                        size="small"
                                        disabled={readOnly}
                                        onClick={() => onInventoryChange(branch.id, "maxInventory", -1)}
                                    >
                                        <Minus size={18} color={theme.palette.text.secondary} />
                                    </IconButton>
                                    <InventoryInput
                                        size="small"
                                        value={branch.maxInventory}
                                        disabled={readOnly}
                                        onChange={(e) =>
                                            onInventoryInputChange(branch.id, "maxInventory", e.target.value)
                                        }
                                        inputProps={{ style: { textAlign: "center" } }}
                                    />
                                    <IconButton
                                        size="small"
                                        disabled={readOnly}
                                        onClick={() => onInventoryChange(branch.id, "maxInventory", 1)}
                                    >
                                        <Plus size={18} color={theme.palette.text.secondary} />
                                    </IconButton>
                                </InventoryControl>
                            </Stack>
                        </BranchItem>
                    ))
                }
            </Stack>
        </FormCard>
    );
}
