import { useState, useMemo } from "react";
import { Button, Divider, Stack, Typography, CircularProgress } from "@mui/material";
import numeral from "numeral";
import { FormSelect } from "@/components/Form";
import { NumberInput } from "@/components/Folypuntos";
import { SideModal } from "@/components/SideModal";
import {
    BreakdownItem,
    ShortageCard,
    CurrentCashCard,
    DenominationItem,
    DenominationBadge,
    WithdrawalTotalCard,
} from "@/styles/cajas.styles";
import { StatusChip } from "../StatusChip";

export type CutType = "partial" | "final";

export interface Denomination {
    value: number;
    label: string;
    type: "bill" | "coin";
    color: string;
}

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
    withdrawalAmount: number;
    totalIncome: number;
    shortage: number;
    denominations: Denomination[];
    isLoading?: boolean;
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
    withdrawalAmount,
    totalIncome,
    shortage,
    denominations,
    isLoading = false,
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
        if (!isCutValid) return;
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

    const partialCutExceeds = useMemo(() => {
        return cutType === "partial" && withdrawalTotal > currentCash;
    }, [cutType, withdrawalTotal, currentCash]);

    const isCutValid = useMemo(() => {
        if (cutType === "partial") {
            return withdrawalTotal > 0 && !partialCutExceeds;
        }
        return true;
    }, [cutType, withdrawalTotal, partialCutExceeds]);

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
                            <Typography variant="body1">Efectivo actual</Typography>
                            <Typography variant="subtitle1">{numeral(currentCash).format("$0,0.00")}</Typography>
                        </CurrentCashCard>
                    }

                    {
                        cutType === "final" &&
                        <CurrentCashCard>
                            <Typography variant="body1">Corte final</Typography>
                            <Typography variant="subtitle1">{numeral(totalIncome).format("$0,0.00")}</Typography>
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

                                                <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 6 }}>
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

                            <Stack>
                                <Typography variant="subtitle1">Desgloce de caja</Typography>
                                <Stack>
                                    <BreakdownItem>
                                        <Typography variant="body1">Fondo inicial</Typography>
                                        <Typography variant="subtitle1" fontWeight={600}>{numeral(initialFund).format("$0,0.00")}</Typography>
                                    </BreakdownItem>
                                    <BreakdownItem>
                                        <Typography variant="body1">Efectivo</Typography>
                                        <Typography variant="subtitle1" fontWeight={600}>{numeral(cash).format("$0,0.00")}</Typography>
                                    </BreakdownItem>
                                    <BreakdownItem>
                                        <Typography variant="body1">Tarjeta de crédito</Typography>
                                        <Typography variant="subtitle1" fontWeight={600}>{numeral(creditCard).format("$0,0.00")}</Typography>
                                    </BreakdownItem>
                                    <BreakdownItem>
                                        <Typography variant="body1">Depósitos en efectivo</Typography>
                                        <Typography variant="subtitle1" fontWeight={600}>{numeral(cashDeposits).format("$0,0.00")}</Typography>
                                    </BreakdownItem>
                                    <BreakdownItem sx={{ borderBottom: 'none' }}>
                                        <Typography variant="body1">Retiros de caja ({withdrawals})</Typography>
                                        <Typography variant="subtitle1" fontWeight={600}>-{numeral(withdrawalAmount).format("$0,0.00")}</Typography>
                                    </BreakdownItem>
                                </Stack>
                            </Stack>
                        </>
                }
                {
                    partialCutExceeds &&
                    <Typography variant="body2" color="error.main" textAlign="center">El monto excede el efectivo disponible</Typography>
                }
                <Divider />

                {
                    cutType === "final" &&
                    <ShortageCard>
                        <Typography variant="body2" color="text.secondary">Faltante</Typography>
                        <Typography variant="subtitle1" fontWeight={600}>{numeral(shortage).format("$0,0.00")}</Typography>
                    </ShortageCard>
                }

                <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleConfirm}
                    disabled={isLoading || !isCutValid}>
                    {isLoading ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        cutType === "final"
                            ? "Realizar corte final"
                            : "Realizar corte parcial"
                    )}
                </Button>
            </Stack>
        </SideModal >
    );
}
