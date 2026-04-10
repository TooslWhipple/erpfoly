import { Button, Grid, InputAdornment, Stack, Typography } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { FormTextField } from "@/components";
import {
    FormCard,
    DynamicListItem,
    DeleteButton,
    DeleteButtonWrapper
} from "@/styles/catalogos/proveedores.styles";
import type { Promotion } from "@/types/proveedores.types";
import { Trash } from "lucide-react";

export interface PromotionsTabProps {
    promotions: Promotion[];
    onAddPromotion: () => void;
    onRemovePromotion: (promotionId: string) => void;
    onPromotionChange: (
        promotionId: string,
        field: keyof Promotion,
        value: string
    ) => void;
}

export function PromotionsTab({
    promotions,
    onAddPromotion,
    onRemovePromotion,
    onPromotionChange,
}: PromotionsTabProps) {
    return (
        <FormCard>
            <Stack spacing={0.5}>
                <Typography variant="h6">Promociones</Typography>
                <Typography variant="body2" color="text.secondary">
                    Estos son Promociones generales del proveedor y se aplicarán a
                    todos los productos del mismo.
                </Typography>
            </Stack>
            <Stack spacing={3} width="100%">
                {promotions.map((promotion) => (
                    <DynamicListItem key={promotion.id}>
                        <Grid container spacing={2} alignItems="flex-end">
                            <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                <FormTextField
                                    label="Promoción"
                                    placeholder="Ingrese la descripción de la promoción"
                                    value={promotion.description}
                                    onChange={(e) =>
                                        onPromotionChange(
                                            promotion.id,
                                            "description",
                                            e.target.value
                                        )
                                    }
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                <FormTextField
                                    label="Porcentaje (%)"
                                    placeholder="0.00"
                                    type="number"
                                    value={promotion.percentage}
                                    onChange={(e) =>
                                        onPromotionChange(
                                            promotion.id,
                                            "percentage",
                                            e.target.value
                                        )
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                %
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                <FormTextField
                                    label="Fecha inicio"
                                    type="date"
                                    value={promotion.startDate}
                                    onChange={(e) =>
                                        onPromotionChange(
                                            promotion.id,
                                            "startDate",
                                            e.target.value
                                        )
                                    }
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: "grow" }}>
                                <FormTextField
                                    label="Fecha fin"
                                    type="date"
                                    value={promotion.endDate}
                                    onChange={(e) =>
                                        onPromotionChange(
                                            promotion.id,
                                            "endDate",
                                            e.target.value
                                        )
                                    }
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>
                            <Grid sx={{ display: { xs: "none", sm: "block" } }}>
                                <DeleteButton
                                    size="small"
                                    onClick={() =>
                                        onRemovePromotion(promotion.id)
                                    }
                                >
                                    <Trash size={16} />
                                </DeleteButton>
                            </Grid>
                            <DeleteButtonWrapper>
                                <DeleteButton
                                    size="small"
                                    onClick={() =>
                                        onRemovePromotion(promotion.id)
                                    }
                                    sx={{ display: { xs: "block", sm: "none" } }}
                                >
                                    <Trash size={16} />
                                </DeleteButton>
                            </DeleteButtonWrapper>
                        </Grid>
                    </DynamicListItem>
                ))}
            </Stack>
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={onAddPromotion}
            >
                Agregar otro
            </Button>
        </FormCard>
    );
}
