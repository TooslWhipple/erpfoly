import { useState, useMemo } from "react";
import { Dialog, Box, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { FormSelect, FormTextField } from "@/components/Form";
import {
  StyledDialogContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  WithdrawalSection,
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
          <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
            Retiro de efectivo
          </Typography>

          <CurrentCashCard>
            <CurrentCashLabel>Efectivo actual</CurrentCashLabel>
            <CurrentCashValue>
              ${currentCash.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
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
            <Box sx={{ flex: 1 }}>
              <FormSelect
                label="Banco"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                options={banks}
                placeholder="Seleccione un banco"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FormTextField
                label="Numero de cheque"
                placeholder="Ingrese"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
              />
            </Box>
          </WithdrawalFieldsRow>

          <AvailableAfterWithdrawalCard>
            <AvailableAfterWithdrawalLabel>
              Monto disponible despues del retiro:
            </AvailableAfterWithdrawalLabel>
            <AvailableAfterWithdrawalValue>
              ${availableAfterWithdrawal.toLocaleString("es-MX", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </AvailableAfterWithdrawalValue>
          </AvailableAfterWithdrawalCard>
        </Box>

        <WithdrawalModalActions>
          <WithdrawalButton variant="contained" onClick={handleConfirm} fullWidth>
            Realizar retiro
          </WithdrawalButton>
        </WithdrawalModalActions>
      </StyledDialogContent>
    </Dialog>
  );
}
