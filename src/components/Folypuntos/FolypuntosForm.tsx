import { useCallback } from "react";
import { Stack, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import {
    FormCard,
    NumberInputContainer,
    NumberInputArrow,
    StepperGroupLabel,
} from "@/styles/catalogos/folypuntos.styles";
import { CurrencyInput } from "./CurrencyInput";
import { NumberInput } from "./NumberInput";
import type { PointsFormState } from "@/types/folypuntos.types";

export type PointsFormField = "amountToSpend" | "pointsAwarded" | "amountPerPoint";

export interface FolypuntosFormProps {
    formState: PointsFormState;
    activePurchaseTypeId: string;
    onFieldChange: (
        purchaseTypeId: string,
        field: PointsFormField,
        value: number
    ) => void;
    disabled?: boolean;
}

const PURCHASE_SECTION = {
    title: "Equivalencia de compra a Folypuntos",
    description:
        "Configura cuántos Folypuntos se otorgan por cada peso gastado. La generación vigente aplica solo a ventas a crédito.",
} as const;

const SALE_SECTION = {
    title: "Equivalencia de venta a Folypuntos",
    description:
        "1 Folypunto vale $1.00 MXN al canjearse. Esta equivalencia no se puede modificar.",
} as const;

const DEFAULT_CONFIG = {
    amountToSpend: 10,
    pointsAwarded: 1,
    amountPerPoint: 1,
};

export function FolypuntosForm({
    formState,
    activePurchaseTypeId,
    onFieldChange,
    disabled = false,
}: FolypuntosFormProps) {
    const config = formState[activePurchaseTypeId] ?? DEFAULT_CONFIG;

    const handleChange = useCallback(
        (field: PointsFormField) => (value: number) => {
            onFieldChange(activePurchaseTypeId, field, value);
        },
        [activePurchaseTypeId, onFieldChange]
    );

    return (
        <Stack spacing={2}>
            <FormCard>
                <Stack spacing={0.5}>
                    <Typography variant="h6">{PURCHASE_SECTION.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{PURCHASE_SECTION.description}</Typography>
                </Stack>
                <NumberInputContainer>
                    <CurrencyInput
                        value={config.amountToSpend}
                        onChange={handleChange("amountToSpend")}
                        min={1}
                        max={999999}
                        step={1}
                        decimals={0}
                        disabled={disabled}
                        currencySymbol="$"
                        prefix="Por cada"
                        unit="pesos"
                    />
                    <NumberInputArrow>
                        <ArrowForwardIcon fontSize="small" />
                    </NumberInputArrow>
                    <NumberInput
                        value={config.pointsAwarded}
                        onChange={handleChange("pointsAwarded")}
                        min={1}
                        max={9999}
                        step={1}
                        disabled={disabled}
                        width={80}
                        unit="Folypuntos"
                    />
                </NumberInputContainer>
            </FormCard>
            <FormCard>
                <Stack spacing={0.5}>
                    <Typography variant="h6">{SALE_SECTION.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{SALE_SECTION.description}</Typography>
                </Stack>
                <NumberInputContainer>
                    <StepperGroupLabel>
                        <Typography component="span">1 Folypunto</Typography>
                    </StepperGroupLabel>
                    <NumberInputArrow>
                        <ArrowForwardIcon fontSize="small" />
                    </NumberInputArrow>
                    <Typography variant="body1" fontWeight={600}>
                        $1.00 MXN
                    </Typography>
                </NumberInputContainer>
            </FormCard>
        </Stack>
    );
}
