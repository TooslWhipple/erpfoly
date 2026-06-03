import { useState, useMemo } from "react";
import { Stack, Typography, Divider, Button } from "@mui/material";
import numeral from "numeral";
import { FormSelect, FormTextField } from "@/components/Form";
import { SideModal } from "@/components/SideModal";
import {
  CurrentCashCard,
  CurrentCashLabel,
  CurrentCashValue,
  WithdrawalAmountInput,
  WithdrawalTotalCard,
} from "@/styles/cajas.styles";
import { StatusChip } from "../StatusChip";

export interface CashWithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, bank: string, checkNumber: string) => void;
  cashRegisterName: string;
  currentCash: number;
  banks: Array<{ value: string; label: string }>;
}

export function CashWithdrawalModal({
  open,
  onClose,
  onConfirm,
  cashRegisterName,
  currentCash,
  banks,
}: CashWithdrawalModalProps) {
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("0.00");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [checkNumber, setCheckNumber] = useState<string>("");

  const handleClose = (_event: object, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      onClose();
      setWithdrawalAmount("0.00");
      setSelectedBank("");
      setCheckNumber("");
    }
  };

  const handleConfirm = () => {
    const amount = parseFloat(withdrawalAmount) || 0;
    onConfirm(amount, selectedBank, checkNumber);
    setWithdrawalAmount("0.00");
    setSelectedBank("");
    setCheckNumber("");
    onClose();
  };

  const availableAfterWithdrawal = useMemo(() => {
    const amount = parseFloat(withdrawalAmount) || 0;
    return Math.max(0, currentCash - amount);
  }, [withdrawalAmount, currentCash]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      setWithdrawalAmount(inputValue);
    }
  };

  const handleAmountBlur = () => {
    const numValue = parseFloat(withdrawalAmount) || 0;
    setWithdrawalAmount(numValue.toFixed(2));
  };

  const handleBankChange = (event: React.ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } })) => {
    const value = typeof event.target.value === 'string' ? event.target.value : String(event.target.value || '');
    setSelectedBank(value);
  };

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
          <Typography variant="h4">Retiro de efectivo</Typography>
          <CurrentCashCard>
            <CurrentCashLabel>Efectivo actual</CurrentCashLabel>
            <CurrentCashValue>
              {numeral(currentCash).format("$0,0.00")}
            </CurrentCashValue>
          </CurrentCashCard>
        </Stack>
      }>
      <Divider />
      <Stack direction="column" spacing={3} style={{ padding: "8px 24px 24px" }}>

        <Stack spacing={2} alignItems="center">
          <Typography variant="subtitle1">Ingresa el monto a retirar:</Typography>
          <WithdrawalAmountInput
            value={withdrawalAmount}
            onChange={handleAmountChange}
            onBlur={handleAmountBlur}
            placeholder="0.00"
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <FormSelect
            label="Banco"
            value={selectedBank}
            onChange={handleBankChange}
            options={banks}
            placeholder="Seleccione un banco"
          />
          <FormTextField
            label="Numero de cheque"
            placeholder="Ingrese"
            value={checkNumber}
            onChange={(e) => setCheckNumber(e.target.value)}
          />
        </Stack>

        <WithdrawalTotalCard>
          <Typography variant="body2" color="text.secondary">Monto disponible despues del retiro:</Typography>
          <Typography variant="subtitle1">{numeral(availableAfterWithdrawal).format("$0,0.00")}</Typography>
        </WithdrawalTotalCard>

        <Divider />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleConfirm}>
          Realizar retiro
        </Button>
      </Stack>
    </ SideModal>
  );
}
