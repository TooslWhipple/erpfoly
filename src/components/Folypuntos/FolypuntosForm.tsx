import { Box, Typography } from "@mui/material";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import {
    FormCard,
    Section,
    SectionTitle,
    SectionDescription,
    NumberInputContainer,
    NumberInputLabel,
    NumberInputArrow,
} from "@/styles/catalogos/folypuntos.styles";
import { NumberInput } from "./NumberInput";
import { CurrencyInput } from "./CurrencyInput";
import type { FolypuntosFormState, PaymentType } from "@/types/folypuntos.types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface FolypuntosFormProps {
    /** Current form state */
    formState: FolypuntosFormState;
    /** Active payment type tab */
    activePaymentType: PaymentType;
    /** Callback when form values change */
    onFieldChange: (
        paymentType: PaymentType,
        field: "purchaseEquivalence" | "saleEquivalence",
        value: number
    ) => void;
    /** Disable form inputs */
    disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FolypuntosForm({
    formState,
    activePaymentType,
    onFieldChange,
    disabled = false,
}: FolypuntosFormProps) {
    const currentConfig = formState[activePaymentType];

    const handlePurchaseEquivalenceChange = (value: number) => {
        // Update only the active payment type
        onFieldChange(activePaymentType, "purchaseEquivalence", value);
    };

    const handleSaleEquivalenceChange = (value: number) => {
        // Update only the active payment type
        onFieldChange(activePaymentType, "saleEquivalence", value);
    };

    return (
        <Box>
            {/* Purchase Equivalence Section */}
            <FormCard>
                <Section>
                    <SectionTitle>Equivalencia de compra a Folypuntos</SectionTitle>
                    <SectionDescription>
                        Configura la cantidad de Folypuntos que se otorgan por cada peso gastado.
                    </SectionDescription>
                    <NumberInputContainer>
                        <NumberInputLabel>Por cada</NumberInputLabel>
                        <NumberInput
                            value={currentConfig.purchaseEquivalence}
                            onChange={handlePurchaseEquivalenceChange}
                            min={1}
                            max={999999}
                            step={1}
                            disabled={disabled}
                            width={80}
                        />
                        <NumberInputLabel>pesos</NumberInputLabel>
                        <NumberInputArrow>
                            <ArrowForwardIcon fontSize="small" />
                        </NumberInputArrow>
                        <NumberInput
                            value={1}
                            onChange={() => {}} // Fixed value: 1 Folypunto
                            min={1}
                            max={1}
                            disabled={true}
                            width={80}
                        />
                        <NumberInputLabel>Folypuntos</NumberInputLabel>
                    </NumberInputContainer>
                </Section>
            </FormCard>

            {/* Sale Equivalence Section */}
            <FormCard>
                <Section>
                    <SectionTitle>Equivalencia de venta a Folypuntos</SectionTitle>
                    <SectionDescription>
                        Configura el valor en pesos que tendrá cada Folypunto al ser canjeado.
                    </SectionDescription>
                    <NumberInputContainer>
                        <NumberInputLabel>1 Folypunto</NumberInputLabel>
                        <NumberInputArrow>
                            <ArrowForwardIcon fontSize="small" />
                        </NumberInputArrow>
                        <CurrencyInput
                            value={currentConfig.saleEquivalence}
                            onChange={handleSaleEquivalenceChange}
                            min={0.01}
                            max={999999.99}
                            step={0.01}
                            disabled={disabled}
                            currencySymbol="$"
                            decimals={2}
                        />
                        <NumberInputLabel>pesos mexicanos</NumberInputLabel>
                    </NumberInputContainer>
                </Section>
            </FormCard>
        </Box>
    );
}
