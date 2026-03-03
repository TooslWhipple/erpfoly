import { Grid, Stack, Typography } from "@mui/material";
import { MultiSelectChips } from "@/components/MultiSelectChips";
import { FormCard } from "@/styles/catalogos/productos.styles";
import type { PromotionFormState } from "@/types/promociones.types";
import { MOCK_BRANCHES } from "@/data/promociones.mockData";

interface BranchesTabProps {
    formState: PromotionFormState;
    onFieldChange: (field: keyof PromotionFormState, value: any) => void;
}

export function BranchesTab({
    formState,
    onFieldChange,
}: BranchesTabProps) {
    // Convert branches to SelectableItem format
    const branchItems = MOCK_BRANCHES.map((branch) => ({
        id: branch.id,
        label: branch.name,
    }));

    const handleBranchChange = (selectedIds: (string | number)[]) => {
        onFieldChange("selectedBranchIds", selectedIds);
    };

    return (
        <FormCard>
            <Stack spacing={0.5}>
                <Typography variant="h6">Sucursales</Typography>
                <Typography variant="body2" color="text.secondary">
                    Configura las sucursales donde aplicará este Promoción
                </Typography>
            </Stack>
            <MultiSelectChips
                items={branchItems}
                selectedIds={formState.selectedBranchIds || []}
                onChange={handleBranchChange}
            />
        </FormCard>
    );
}
