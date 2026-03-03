import { useCallback } from "react";
import { Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import {
    FormCard,
    Section,
    SectionTitle,
    SectionDescription,
    NumberInputContainer,
    NumberInputArrow,
    StepperGroupLabel,
} from "@/styles/catalogos/folypuntos.styles";
import { CurrencyInput } from "./CurrencyInput";
import { NumberInput } from "./NumberInput";
import type { FolypuntosFormState, PaymentType } from "@/types/folypuntos.types";

export type FolypuntosField = "purchaseEquivalence" | "saleEquivalence";

export interface FolypuntosFormProps {
    formState: FolypuntosFormState;
    activePaymentType: PaymentType;
    onFieldChange: (
        paymentType: PaymentType,
        field: FolypuntosField,
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

export function FolypuntosForm({
    formState,
    activePaymentType,
    onFieldChange,
    disabled = false,
}: FolypuntosFormProps) {
    const config = formState[activePaymentType];

    const handleChange = useCallback(
        (field: FolypuntosField) => (value: number) => {
            onFieldChange(activePaymentType, field, value);
        },
        [activePaymentType, onFieldChange]
    );

    return (
        <>
            <FormCard>
                <Section>
                    <SectionTitle>{PURCHASE_SECTION.title}</SectionTitle>
                    <SectionDescription>
                        {PURCHASE_SECTION.description}
                    </SectionDescription>
                    <NumberInputContainer>
                        <CurrencyInput
                            value={config.purchaseEquivalence}
                            onChange={handleChange("purchaseEquivalence")}
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
                            value={1}
                            onChange={() => {}}
                            min={1}
                            max={1}
                            disabled
                            width={80}
                            unit="Folypuntos"
                        />
                    </NumberInputContainer>
                </Section>
            </FormCard>

            <FormCard>
                <Section>
                    <SectionTitle>{SALE_SECTION.title}</SectionTitle>
                    <SectionDescription>
                        {SALE_SECTION.description}
                    </SectionDescription>
                    <NumberInputContainer>
                        <StepperGroupLabel>
                            <Typography component="span">1 Folypunto</Typography>
                        </StepperGroupLabel>
                        <NumberInputArrow>
                            <ArrowForwardIcon fontSize="small" />
                        </NumberInputArrow>
                        <CurrencyInput
                            value={config.saleEquivalence}
                            onChange={handleChange("saleEquivalence")}
                            min={0.01}
                            max={999999.99}
                            step={0.01}
                            disabled={disabled}
                            currencySymbol="$"
                            decimals={2}
                            unit="pesos mexicanos."
                        />
                    </NumberInputContainer>
                </Section>
            </FormCard>
        </>
    );
}
