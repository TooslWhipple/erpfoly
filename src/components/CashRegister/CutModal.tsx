import { useState, useMemo } from "react";
import { Button, Divider, Stack, Typography } from "@mui/material";
import { KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import numeral from "numeral";
import { FormSelect } from "@/components/Form";
import { NumberInput } from "@/components/Folypuntos";
import { SideModal } from "@/components/SideModal";
import {
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
    CurrentCashCard,
    CurrentCashLabel,
    CurrentCashValue,
    DenominationItem,
    DenominationBadge,
    WithdrawalTotalCard,
} from "@/styles/cajas.styles";
import { StatusChip } from "../StatusChip";

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
        <SideModal
            fullWidth
            maxWidth="md"
            open={open}
            onClose={onClose}
            contentSx={{ backgroundColor: "white", padding: 0 }}
            headerContent={
                <Stack spacing={2}>
                    <Stack direction="row" width="100%" alignItems="center" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">{cashRegisterName}</Typography>
                        <StatusChip label="Abierta" variant="success" size="small" />
                    </Stack>

                    <FormSelect
                        label="Tipo de corte"
                        value={cutType}
                        onChange={(e) => {
                            setCutType(e.target.value as CutType);
                            setWithdrawalQuantities({});
                        }}
                        options={cutTypeOptions}
                    />

                    {
                        cutType === "partial" &&
                        <CurrentCashCard>
                            <CurrentCashLabel>Efectivo actual</CurrentCashLabel>
                            <CurrentCashValue>
                                {numeral(currentCash).format("$0,0.00")}
                            </CurrentCashValue>
                        </CurrentCashCard>
                    }
                </Stack>
            }>

            <Divider />

            <Stack direction="column" spacing={3} style={{ padding: "8px 24px 24px" }}>
                {
                    cutType === "partial" ?
                        <Stack spacing={2}>
                            <Typography variant="subtitle1">Ingresa el monto a retirar:</Typography>

                            <Stack spacing={1}>
                                {
                                    denominations.map((denom) => {
                                        const quantity = withdrawalQuantities[denom.value] || 0;
                                        const subtotal = withdrawalSubtotals[denom.value] || 0;

                                        return (
                                            <DenominationItem key={denom.value}>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <DenominationBadge
                                                        sx={{
                                                            backgroundColor: denom.color,
                                                            color: "white",
                                                        }}>
                                                        ${denom.value}
                                                    </DenominationBadge>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {
                                                            (denom.type === "bill") ? "Billete" : "Moneda"
                                                        }
                                                    </Typography>
                                                </Stack>

                                                <Stack direction="row" alignItems="center" spacing={6}>
                                                    <NumberInput
                                                        size="small"
                                                        value={quantity}
                                                        onChange={(val) => handleQuantityChange(val, denom.value)}
                                                        min={0}
                                                        max={9999}
                                                        step={1}
                                                        width={60}
                                                    />
                                                    <Typography variant="subtitle1">{numeral(subtotal).format("$0,0.00")}</Typography>
                                                </Stack>
                                            </DenominationItem>
                                        );
                                    })
                                }
                            </Stack>

                            <WithdrawalTotalCard>
                                <Typography variant="body2" color="text.secondary">Total:</Typography>
                                <Typography variant="subtitle1" color="text.primary" fontWeight={600}>{numeral(withdrawalTotal).format("$0,0.00")}</Typography>
                            </WithdrawalTotalCard>
                        </Stack>
                        :
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
                }
                <Divider />
                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleConfirm}>
                    {
                        (cutType === "final")
                            ? "Realizar corte final"
                            : "Realizar corte parcial"
                    }
                </Button>
            </Stack>
        </SideModal >
    );
}
