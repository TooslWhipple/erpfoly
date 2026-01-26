import { Switch } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import {
    Section,
    SectionTitle,
    SectionDescription,
    BranchListContainer,
    BranchItem,
    BranchName,
    InventoryControl,
    InventoryLabel,
    InventoryInput,
    InventoryButton,
} from "@/styles/catalogos/productos.styles";
import type { ProductBranch } from "../types";

// ============================================================================
// TYPES
// ============================================================================

interface BranchesTabProps {
    branches: ProductBranch[];
    onBranchToggle: (branchId: string) => void;
    onInventoryChange: (branchId: string, field: "minInventory" | "maxInventory", delta: number) => void;
    onInventoryInputChange: (branchId: string, field: "minInventory" | "maxInventory", value: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BranchesTab({
    branches,
    onBranchToggle,
    onInventoryChange,
    onInventoryInputChange,
}: BranchesTabProps) {
    return (
        <Section>
            <SectionTitle>Sucursales de venta</SectionTitle>
            <SectionDescription>
                Configura las sucursales en las cuales se puede vender este artículo y el mínimo y máximo de inventario permitido.
            </SectionDescription>
            <BranchListContainer>
                {branches.map((branch) => (
                    <BranchItem key={branch.id}>
                        <Switch
                            checked={branch.enabled}
                            onChange={() => onBranchToggle(branch.id)}
                            color="primary"
                        />
                        <BranchName>{branch.branchName}</BranchName>
                        <InventoryControl>
                            <InventoryLabel>Min:</InventoryLabel>
                            <InventoryButton
                                size="small"
                                onClick={() => onInventoryChange(branch.id, "minInventory", -1)}
                            >
                                <RemoveIcon fontSize="small" />
                            </InventoryButton>
                            <InventoryInput
                                size="small"
                                value={branch.minInventory}
                                onChange={(e) =>
                                    onInventoryInputChange(branch.id, "minInventory", e.target.value)
                                }
                                inputProps={{ style: { textAlign: "center" } }}
                            />
                            <InventoryButton
                                size="small"
                                onClick={() => onInventoryChange(branch.id, "minInventory", 1)}
                            >
                                <AddIcon fontSize="small" />
                            </InventoryButton>
                        </InventoryControl>
                        <InventoryControl>
                            <InventoryLabel>Max:</InventoryLabel>
                            <InventoryButton
                                size="small"
                                onClick={() => onInventoryChange(branch.id, "maxInventory", -1)}
                            >
                                <RemoveIcon fontSize="small" />
                            </InventoryButton>
                            <InventoryInput
                                size="small"
                                value={branch.maxInventory}
                                onChange={(e) =>
                                    onInventoryInputChange(branch.id, "maxInventory", e.target.value)
                                }
                                inputProps={{ style: { textAlign: "center" } }}
                            />
                            <InventoryButton
                                size="small"
                                onClick={() => onInventoryChange(branch.id, "maxInventory", 1)}
                            >
                                <AddIcon fontSize="small" />
                            </InventoryButton>
                        </InventoryControl>
                    </BranchItem>
                ))}
            </BranchListContainer>
        </Section>
    );
}
