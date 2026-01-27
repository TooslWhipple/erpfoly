import { useState, useMemo } from "react";
import { Dialog, IconButton, Box, Button, Typography } from "@mui/material";
import { Close as CloseIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import numeral from "numeral";
import { NumberInput } from "@/components/Folypuntos";
import {
  StyledDialogContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  WithdrawalSection,
  WithdrawalSectionHeader,
  WithdrawalSectionTitle,
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
  WithdrawalModalActions,
  WithdrawalButton,
} from "@/styles/cajas.styles";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Denomination {
  value: number;
  label: string;
  type: "bill" | "coin";
  color: string;
}

export interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (withdrawals: Record<number, number>) => void;
  cashRegisterName: string;
  currentCash: number;
  denominations: Denomination[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WithdrawalModal({
  open,
  onClose,
  onConfirm,
  cashRegisterName,
  currentCash,
  denominations,
}: WithdrawalModalProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const handleClose = (_event: object, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      onClose();
      setQuantities({});
    }
  };

  const handleQuantityChange = (value: number, denominationValue: number) => {
    setQuantities((prev) => ({
      ...prev,
      [denominationValue]: value,
    }));
  };

  const handleConfirm = () => {
    onConfirm(quantities);
    setQuantities({});
    onClose();
  };

  const subtotals = useMemo(() => {
    const subs: Record<number, number> = {};
    denominations.forEach((denom) => {
      const qty = quantities[denom.value] || 0;
      subs[denom.value] = qty * denom.value;
    });
    return subs;
  }, [quantities, denominations]);

  const total = useMemo(() => {
    return Object.values(subtotals).reduce((sum, val) => sum + val, 0);
  }, [subtotals]);

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
          <WithdrawalSection>
            <WithdrawalSectionHeader>
              <WithdrawalSectionTitle>Retiro Parcial</WithdrawalSectionTitle>
              <KeyboardArrowDownIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            </WithdrawalSectionHeader>

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
                const quantity = quantities[denom.value] || 0;
                const subtotal = subtotals[denom.value] || 0;

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
                {numeral(total).format("$0,0.00")}
              </WithdrawalTotalValue>
            </WithdrawalTotalCard>
          </WithdrawalSection>
        </Box>

        <WithdrawalModalActions>
          <WithdrawalButton variant="contained" onClick={handleConfirm} fullWidth>
            Realizar retiro parcial
          </WithdrawalButton>
        </WithdrawalModalActions>
      </StyledDialogContent>
    </Dialog>
  );
}
