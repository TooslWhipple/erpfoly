import { Stack, Typography, CircularProgress } from "@mui/material";
import { MultiSelectChips } from "@/components/MultiSelectChips";
import { FormCard } from "@/styles/catalogos/productos.styles";
import type { PromotionFormState } from "@/types/promociones.types";
import type { BranchCatalogItem } from "@/services/branches.service";

interface BranchesTabProps {
  formState: PromotionFormState;
  onFieldChange: (field: keyof PromotionFormState, value: unknown) => void;
  branchCatalog: BranchCatalogItem[];
  branchesCatalogLoading: boolean;
}

export function BranchesTab({
  formState,
  onFieldChange,
  branchCatalog,
  branchesCatalogLoading,
}: BranchesTabProps) {
  const branchItems = (Array.isArray(branchCatalog) ? branchCatalog : []).map((branch) => ({
    id: branch.id,
    label: branch.name,
  }));

  const handleBranchChange = (selectedIds: (string | number)[]) => {
    onFieldChange("selectedBranchIds", selectedIds.map((id) => Number(id)).filter((n) => Number.isFinite(n)));
  };

  return (
    <FormCard>
      <Stack spacing={0.5}>
        <Typography variant="h6">Sucursales</Typography>
        <Typography variant="body2" color="text.secondary">Configura las sucursales donde aplicará este Promoción</Typography>
      </Stack>
      {
        (branchesCatalogLoading) ?
          <div
            style={{ paddingTop: "32px", display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </div>
          :
          <MultiSelectChips
            items={branchItems}
            selectedIds={formState.selectedBranchIds || []}
            onChange={handleBranchChange}
          />
      }
    </FormCard>
  );
}
