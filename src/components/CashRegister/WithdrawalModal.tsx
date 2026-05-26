import { useState, useMemo } from "react";
import { Stack } from "@mui/material";
import { Close as CloseIcon, KeyboardArrowDown as KeyboardArrowDownIcon } from "@mui/icons-material";
import numeral from "numeral";
import { NumberInput } from "@/components/Folypuntos";
import { SideModal } from "@/components/SideModal";
import {
  DialogContent,
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
                    <Stack direction="row" alignItems="center" spacing={1.5}>
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
                    </Stack>

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
        </Stack>

        <WithdrawalModalActions>
          <WithdrawalButton variant="contained" onClick={handleConfirm} fullWidth>
            Realizar retiro parcial
          </WithdrawalButton>
        </WithdrawalModalActions>
        </DialogContent>
    </SideModal>
  );
}
