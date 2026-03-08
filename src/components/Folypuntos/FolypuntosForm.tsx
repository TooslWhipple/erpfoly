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
        "Configura la cantidad de Folypuntos que se otorgan por cada peso gastado.",
} as const;

const SALE_SECTION = {
    title: "Equivalencia de venta a Folypuntos",
    description:
        "Configura el valor en pesos que tendrá cada Folypunto al ser canjeado.",
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
                <Typography variant="h6">{PURCHASE_SECTION.title}</Typography>
                <Typography variant="body2" color="text.secondary">{PURCHASE_SECTION.description}</Typography>
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
                <Typography variant="h6">{SALE_SECTION.title}</Typography>
                <Typography variant="body2" color="text.secondary">{SALE_SECTION.description}</Typography>
                <NumberInputContainer>
                    <StepperGroupLabel>
                        <Typography component="span">1 Folypunto</Typography>
                    </StepperGroupLabel>
                    <NumberInputArrow>
                        <ArrowForwardIcon fontSize="small" />
                    </NumberInputArrow>
                    <CurrencyInput
                        value={config.amountPerPoint}
                        onChange={handleChange("amountPerPoint")}
                        min={0.01}
                        max={999999.99}
                        step={0.01}
                        disabled={disabled}
                        currencySymbol="$"
                        decimals={2}
                        unit="pesos mexicanos."
                    />
                </NumberInputContainer>
            </FormCard>
        </Stack>
    );
}
