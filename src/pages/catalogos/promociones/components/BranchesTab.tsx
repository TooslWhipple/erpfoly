import { Box, Grid } from "@mui/material";
import { MultiSelectChips } from "@/components/MultiSelectChips";
import { Section, SectionTitle, SectionDescription } from "@/styles/catalogos/productos.styles";
import type { PromotionFormState } from "../types";
import { MOCK_BRANCHES } from "../mockData";

// ============================================================================
// TYPES
// ============================================================================

interface BranchesTabProps {
    formState: PromotionFormState;
    onFieldChange: (field: keyof PromotionFormState, value: any) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

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
        <Box>
            <Section>
                <SectionTitle>Sucursales</SectionTitle>
                <SectionDescription>
                    Configura las sucursales donde aplicará este Promoción
                </SectionDescription>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <MultiSelectChips
                            items={branchItems}
                            selectedIds={formState.selectedBranchIds || []}
                            onChange={handleBranchChange}
                        />
                    </Grid>
                </Grid>
            </Section>
        </Box>
    );
}
