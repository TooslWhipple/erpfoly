import { useState, useMemo } from "react";
import { Dialog, Box } from "@mui/material";
import { Close as CloseIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import numeral from "numeral";
import { FormSelect } from "@/components/Form";
import { NumberInput } from "@/components/Folypuntos";
import {
    StyledDialogContent,
    ModalHeader,
    ModalTitle,
    CloseButton,
    CutSection,
    CutSectionHeader,
    CutSectionTitle,
    TotalIncomeCard,
    TotalIncomeLabel,
    TotalIncomeValue,
    BreakdownList,
    BreakdownItem,
    BreakdownLabel,
    BreakdownValue,
    ShortageCard,
    ShortageLabel,
    ShortageValue,
    CutModalActions,
    CutButton,
    WithdrawalSection,
    CurrentCashCard,
    CurrentCashLabel,
    CurrentCashValue,
    WithdrawalInstruction,
    DenominationList,
    DenominationItem,
    DenominationBadge,
    DenominationTypeLabel,
    DenominationControls,
    DenominationSubtotal,
    WithdrawalTotalCard,
    WithdrawalTotalLabel,
    WithdrawalTotalValue,
} from "@/styles/cajas.styles";
import type { Denomination } from "./WithdrawalModal";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CutType = "partial" | "final";

export interface CutModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (cutType: CutType, withdrawalData?: Record<number, number>) => void;
    cashRegisterName: string;
    initialFund: number;
    currentCash: number;
    cash: number;
    creditCard: number;
    cashDeposits: number;
    withdrawals: number;
    totalIncome: number;
    shortage: number;
    denominations: Denomination[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CutModal({
    open,
    onClose,
    onConfirm,
    cashRegisterName,
    initialFund,
    currentCash,
    cash,
    creditCard,
    cashDeposits,
    withdrawals,
    totalIncome,
    shortage,
    denominations,
}: CutModalProps) {
    const [cutType, setCutType] = useState<CutType>("final");
    const [withdrawalQuantities, setWithdrawalQuantities] = useState<Record<number, number>>({});

    const handleClose = (_event: object, reason: "backdropClick" | "escapeKeyDown") => {
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
            onClose();
            setWithdrawalQuantities({});
        }
    };

    const handleQuantityChange = (value: number, denominationValue: number) => {
        setWithdrawalQuantities((prev) => ({
            ...prev,
            [denominationValue]: value,
        }));
    };

    const handleConfirm = () => {
        if (cutType === "partial") {
            onConfirm(cutType, withdrawalQuantities);
        } else {
            onConfirm(cutType);
        }
        setWithdrawalQuantities({});
        onClose();
    };

    const withdrawalSubtotals = useMemo(() => {
        const subs: Record<number, number> = {};
        denominations.forEach((denom) => {
            const qty = withdrawalQuantities[denom.value] || 0;
            subs[denom.value] = qty * denom.value;
        });
        return subs;
    }, [withdrawalQuantities, denominations]);

    const withdrawalTotal = useMemo(() => {
        return Object.values(withdrawalSubtotals).reduce((sum, val) => sum + val, 0);
    }, [withdrawalSubtotals]);

    const cutTypeOptions = [
        { value: "partial", label: "Corte parcial" },
        { value: "final", label: "Corte final" },
    ];

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    maxHeight: "90vh",
                },
            }}
        >
            <StyledDialogContent>
                <ModalHeader>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                        <ModalTitle>{cashRegisterName}</ModalTitle>
                    </Box>
                    <CloseButton onClick={onClose} size="small">
                        <CloseIcon />
                    </CloseButton>
                </ModalHeader>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
                    <FormSelect
                        label="Tipo de corte"
                        value={cutType}
                        onChange={(e) => {
                            setCutType(e.target.value as CutType);
                            setWithdrawalQuantities({});
                        }}
                        options={cutTypeOptions}
                    />

                    {cutType === "partial" ? (
                        <WithdrawalSection>
                            <CurrentCashCard>
                                <CurrentCashLabel>Efectivo actual</CurrentCashLabel>
                                <CurrentCashValue>
                                    {numeral(currentCash).format("$0,0.00")}
                                </CurrentCashValue>
                            </CurrentCashCard>

                            <WithdrawalInstruction>
                                Ingresa el monto a retirar:
                            </WithdrawalInstruction>

                            <DenominationList>
                                {denominations.map((denom) => {
                                    const quantity = withdrawalQuantities[denom.value] || 0;
                                    const subtotal = withdrawalSubtotals[denom.value] || 0;

                                    return (
                                        <DenominationItem key={denom.value}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <DenominationBadge
                                                    sx={{
                                                        backgroundColor: denom.color,
                                                        color: "white",
                                                    }}
                                                >
                                                    ${denom.value}
                                                </DenominationBadge>
                                                <DenominationTypeLabel>
                                                    {denom.type === "bill" ? "Billete" : "Moneda"}
                                                </DenominationTypeLabel>
                                            </Box>

                                            <DenominationControls>
                                                <NumberInput
                                                    value={quantity}
                                                    onChange={(val) => handleQuantityChange(val, denom.value)}
                                                    min={0}
                                                    max={9999}
                                                    step={1}
                                                    width={60}
                                                />
                                                <DenominationSubtotal>
                                                    {numeral(subtotal).format("$0,0.00")}
                                                </DenominationSubtotal>
                                            </DenominationControls>
                                        </DenominationItem>
                                    );
                                })}
                            </DenominationList>

                            <WithdrawalTotalCard>
                                <WithdrawalTotalLabel>Total:</WithdrawalTotalLabel>
                                <WithdrawalTotalValue>
                                    {numeral(withdrawalTotal).format("$0,0.00")}
                                </WithdrawalTotalValue>
                            </WithdrawalTotalCard>
                        </WithdrawalSection>
                        ) : (
                        <>
                            <CutSection>
                                <CutSectionHeader>
                                    <CutSectionTitle>Corte final</CutSectionTitle>
                                    <KeyboardArrowDownIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                                </CutSectionHeader>
                                <TotalIncomeCard>
                                    <TotalIncomeLabel>Total de ingresos</TotalIncomeLabel>
                                    <TotalIncomeValue>
                                        {numeral(totalIncome).format("$0,0.00")}
                                    </TotalIncomeValue>
                                </TotalIncomeCard>
                            </CutSection>

                            <CutSection>
                                <CutSectionTitle sx={{ mb: 2 }}>Desgloce de caja</CutSectionTitle>
                                <BreakdownList>
                                    <BreakdownItem>
                                        <BreakdownLabel>Fondo inicial</BreakdownLabel>
                                        <BreakdownValue>
                                            {numeral(initialFund).format("$0,0.00")}
                                        </BreakdownValue>
                                    </BreakdownItem>
                                    <BreakdownItem>
                                        <BreakdownLabel>Efectivo</BreakdownLabel>
                                        <BreakdownValue>
                                            {numeral(cash).format("$0,0.00")}
                                        </BreakdownValue>
                                    </BreakdownItem>
                                    <BreakdownItem>
                                        <BreakdownLabel>Tarjeta de crédito</BreakdownLabel>
                                        <BreakdownValue>
                                            {numeral(creditCard).format("$0,0.00")}
                                        </BreakdownValue>
                                    </BreakdownItem>
                                    <BreakdownItem>
                                        <BreakdownLabel>Depósitos en efectivo</BreakdownLabel>
                                        <BreakdownValue>
                                            {numeral(cashDeposits).format("$0,0.00")}
                                        </BreakdownValue>
                                    </BreakdownItem>
                                    <BreakdownItem>
                                        <BreakdownLabel>Retiros de caja ({withdrawals})</BreakdownLabel>
                                        <BreakdownValue sx={{ color: "error.main" }}>
                                            -{numeral(Math.abs(withdrawals)).format("$0,0.00")}
                                        </BreakdownValue>
                                    </BreakdownItem>
                                </BreakdownList>
                            </CutSection>

                            <ShortageCard>
                                <ShortageLabel>Faltante</ShortageLabel>
                                <ShortageValue>
                                    {numeral(shortage).format("$0,0.00")}
                                </ShortageValue>
                            </ShortageCard>
                        </>
                    )}
                </Box>

                <CutModalActions>
                    <CutButton variant="contained" onClick={handleConfirm} fullWidth>
                        {cutType === "final" ? "Realizar corte final" : "Realizar corte parcial"}
                    </CutButton>
                </CutModalActions>
            </StyledDialogContent>
        </Dialog>
    );
}
