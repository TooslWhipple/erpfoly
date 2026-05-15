import { useState, useMemo } from "react";
import { Stack, Box, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import numeral from "numeral";
import { FormSelect, FormTextField } from "@/components/Form";
import { SideModal } from "@/components/SideModal";
import {
  DialogContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  CurrentCashCard,
  CurrentCashLabel,
  CurrentCashValue,
  WithdrawalAmountInput,
  WithdrawalAmountLabel,
  WithdrawalFieldsRow,
  AvailableAfterWithdrawalCard,
  AvailableAfterWithdrawalLabel,
  AvailableAfterWithdrawalValue,
  WithdrawalModalActions,
  WithdrawalButton,
} from "@/styles/cajas.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CashWithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number, bank: string, checkNumber: string) => void;
  cashRegisterName: string;
  currentCash: number;
  banks: Array<{ value: string; label: string }>;
}

// ============================================================================
// COMPONENT
// ============================================================================

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
      open={open}
      onClose={onClose}
      title={cashRegisterName}
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        <ModalHeader>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
            <ModalTitle>{cashRegisterName}</ModalTitle>
          </Stack>
          <CloseButton onClick={onClose} size="small">
            <CloseIcon />
          </CloseButton>
        </ModalHeader>

        <Stack direction="column" spacing={3} sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            Retiro de efectivo
          </Typography>

          <CurrentCashCard>
            <CurrentCashLabel>Efectivo actual</CurrentCashLabel>
            <CurrentCashValue>
              {numeral(currentCash).format("$0,0.00")}
            </CurrentCashValue>
          </CurrentCashCard>

          <Box>
            <WithdrawalAmountLabel>
              Ingresa el monto a retirar:
            </WithdrawalAmountLabel>
            <WithdrawalAmountInput
              value={withdrawalAmount}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="0.00"
              InputProps={{
                startAdornment: (
                  <Typography sx={{ mr: 1, color: "text.primary", fontWeight: 600 }}>
                    $
                  </Typography>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  height: 56,
                },
              }}
            />
          </Box>

          <WithdrawalFieldsRow>
            <Stack sx={{ flex: 1 }}>
              <FormSelect
                label="Banco"
                value={selectedBank}
                onChange={handleBankChange}
                options={banks}
                placeholder="Seleccione un banco"
              />
            </Stack>
            <Stack sx={{ flex: 1 }}>
              <FormTextField
                label="Numero de cheque"
                placeholder="Ingrese"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
              />
            </Stack>
          </WithdrawalFieldsRow>

          <AvailableAfterWithdrawalCard>
            <AvailableAfterWithdrawalLabel>
              Monto disponible despues del retiro:
            </AvailableAfterWithdrawalLabel>
            <AvailableAfterWithdrawalValue>
              {numeral(availableAfterWithdrawal).format("$0,0.00")}
            </AvailableAfterWithdrawalValue>
          </AvailableAfterWithdrawalCard>
        </Stack>

        <WithdrawalModalActions>
          <WithdrawalButton variant="contained" onClick={handleConfirm} fullWidth>
            Realizar retiro
          </WithdrawalButton>
        </WithdrawalModalActions>
      </DialogContent>
    </SideModal>
  );
}
