import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { FormSelect, FormTextField } from "@/components/Form";
import { SideModal } from "@/components/SideModal";
import { StatusChip } from "@/components/StatusChip";
import {
  CurrentCashCard,
  WithdrawalAmountInput,
  WithdrawalTotalCard,
} from "@/styles/cajas.styles";
import {
  fundPettyCash,
  getPettyCashOpenRegisters,
  returnAllPettyCashDifferences,
  returnPettyCashDifference,
} from "@/services/petty-cash.service";
import type { PettyCashOpenRegister } from "@/types/petty-cash.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const BANK_OPTIONS = [
  { value: "Banamex", label: "Banamex" },
  { value: "Banorte", label: "Banorte" },
  { value: "HSBC", label: "HSBC" },
  { value: "Santander", label: "Santander" },
  { value: "BBVA", label: "BBVA" },
];

export interface PettyCashWithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branchId: number;
  branchName: string;
  currentPettyCashBalance: number;
  returnRequest?: {
    id: number;
    folio: string;
    amount: number;
  } | null;
  returnAll?: {
    count: number;
    amount: number;
  } | null;
}

export function PettyCashWithdrawalModal({
  open,
  onClose,
  onSuccess,
  branchId,
  branchName,
  currentPettyCashBalance,
  returnRequest = null,
  returnAll = null,
}: PettyCashWithdrawalModalProps) {
  const showSuccess = useSnackbarStore((s) => s.showSuccess);
  const showError = useSnackbarStore((s) => s.showError);

  const [registers, setRegisters] = useState<PettyCashOpenRegister[]>([]);
  const [loadingRegisters, setLoadingRegisters] = useState(false);
  const [selectedRegisterId, setSelectedRegisterId] = useState<string>("");
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("0.00");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [checkNumber, setCheckNumber] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const fixedReturnAmount = returnRequest?.amount ?? returnAll?.amount ?? null;
  const isFixedReturn = fixedReturnAmount !== null;

  useEffect(() => {
    if (!open || !branchId) return;
    let active = true;
    if (fixedReturnAmount !== null) {
      setWithdrawalAmount(fixedReturnAmount.toFixed(2));
    } else {
      setWithdrawalAmount("0.00");
    }
    setLoadingRegisters(true);
    getPettyCashOpenRegisters(branchId)
      .then((res) => {
        if (!active) return;
        const list = res.data ?? [];
        setRegisters(list);
        setSelectedRegisterId(
          list.length > 0 ? String(list[0].cashRegisterId) : "",
        );
      })
      .catch(() => {
        if (active) setRegisters([]);
      })
      .finally(() => {
        if (active) setLoadingRegisters(false);
      });
    return () => {
      active = false;
    };
  }, [open, branchId, fixedReturnAmount]);

  const resetForm = () => {
    setWithdrawalAmount("0.00");
    setSelectedBank("");
    setCheckNumber("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedRegister = useMemo(
    () =>
      registers.find((r) => String(r.cashRegisterId) === selectedRegisterId) ??
      null,
    [registers, selectedRegisterId],
  );

  const currentCash = selectedRegister?.currentCash ?? 0;

  const parsedAmount = useMemo(() => {
    if (fixedReturnAmount !== null) return fixedReturnAmount;
    const val = parseFloat(withdrawalAmount);
    return Number.isFinite(val) ? val : 0;
  }, [withdrawalAmount, fixedReturnAmount]);

  const availableAfterWithdrawal = useMemo(
    () => Math.max(0, currentCash - parsedAmount),
    [currentCash, parsedAmount],
  );

  const newPettyCashBalance = useMemo(
    () => currentPettyCashBalance + parsedAmount,
    [currentPettyCashBalance, parsedAmount],
  );

  const exceedsAvailable = parsedAmount > currentCash;

  const isFormValid =
    Boolean(selectedRegister) &&
    parsedAmount > 0 &&
    !exceedsAvailable &&
    Boolean(selectedBank) &&
    Boolean(checkNumber.trim());

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

  const handleConfirm = async () => {
    if (!isFormValid || !selectedRegister) return;
    setSubmitting(true);
    try {
      if (returnAll) {
        const res = await returnAllPettyCashDifferences(branchId, {
          bank: selectedBank,
          checkNumber: checkNumber.trim(),
          cashRegisterId: selectedRegister.cashRegisterId,
        });
        if (res.error) {
          showError(
            res.error.message ??
              "No se pudo realizar la devolución total al fondo",
          );
          return;
        }
        showSuccess(
          `Devolución total de ${numeral(parsedAmount).format("$0,0.00")} (${returnAll.count} solicitudes) registrada al fondo de caja chica`,
        );
      } else if (returnRequest) {
        const res = await returnPettyCashDifference(returnRequest.id, {
          bank: selectedBank,
          checkNumber: checkNumber.trim(),
          cashRegisterId: selectedRegister.cashRegisterId,
        });
        if (res.error) {
          showError(
            res.error.message ?? "No se pudo realizar la devolución al fondo",
          );
          return;
        }
        showSuccess(
          `Devolución de ${numeral(parsedAmount).format("$0,0.00")} (${returnRequest.folio}) registrada al fondo de caja chica`,
        );
      } else {
        const res = await fundPettyCash(branchId, {
          amount: parsedAmount,
          bank: selectedBank,
          checkNumber: checkNumber.trim(),
          cashRegisterId: selectedRegister.cashRegisterId,
        });
        if (res.error) {
          showError(res.error.message ?? "No se pudo realizar el retiro");
          return;
        }
        showSuccess(
          `Retiro de ${numeral(parsedAmount).format("$0,0.00")} registrado y sumado a caja chica`,
        );
      }
      resetForm();
      onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SideModal
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      contentSx={{ backgroundColor: "white", padding: 0 }}
      headerContent={
        <Stack spacing={2}>
          <Stack
            direction="row"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              {selectedRegister
                ? `${branchName} · ${selectedRegister.cashRegisterName}`
                : branchName}
            </Typography>
            <StatusChip
              label={selectedRegister ? "Abierta" : "Sin caja abierta"}
              variant={selectedRegister ? "success" : "warning"}
              size="small"
            />
          </Stack>
          <Typography variant="h4">
            {returnAll
              ? `Devolver todo al fondo (${returnAll.count})`
              : returnRequest
                ? `Devolver al fondo · ${returnRequest.folio}`
                : "Retiro de efectivo"}
          </Typography>
          <CurrentCashCard>
            <Typography variant="body1">Efectivo actual en caja</Typography>
            <Typography variant="subtitle1">
              {numeral(currentCash).format("$0,0.00")}
            </Typography>
          </CurrentCashCard>
        </Stack>
      }
    >
      <Divider />
      <Stack direction="column" spacing={3} style={{ padding: "16px 24px 24px" }}>
        {loadingRegisters ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress size={24} />
          </Stack>
        ) : registers.length === 0 ? (
          <Alert severity="warning">
            No hay ninguna caja abierta en la sucursal{" "}
            <strong>{branchName}</strong>. Abre una caja en la sucursal para
            poder realizar el retiro de efectivo hacia la caja chica.
          </Alert>
        ) : (
          <>
            {registers.length > 1 && (
              <FormSelect
                label="Caja de sucursal"
                value={selectedRegisterId}
                onChange={(e) =>
                  setSelectedRegisterId(String(e.target.value || ""))
                }
                options={registers.map((r) => ({
                  value: String(r.cashRegisterId),
                  label: `${r.cashRegisterName} (${numeral(r.currentCash).format("$0,0.00")})`,
                }))}
              />
            )}

            <Stack spacing={2} alignItems="center">
              <Typography variant="subtitle1">
                {isFixedReturn
                  ? "Monto a devolver al fondo:"
                  : "Ingresa el monto a retirar:"}
              </Typography>
              <WithdrawalAmountInput
                value={withdrawalAmount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                placeholder="0.00"
                disabled={isFixedReturn}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormSelect
                label="Banco"
                value={selectedBank}
                onChange={(e) => setSelectedBank(String(e.target.value || ""))}
                options={BANK_OPTIONS}
                placeholder="Seleccione un banco"
              />
              <FormTextField
                label="Número de cheque"
                placeholder="Ingrese folio del cheque"
                value={checkNumber}
                onChange={(e) => setCheckNumber(e.target.value)}
              />
            </Stack>

            <Stack spacing={1}>
              <WithdrawalTotalCard>
                <Typography variant="body2" color="text.secondary">
                  Monto disponible después del retiro:
                </Typography>
                <Typography variant="subtitle1">
                  {numeral(availableAfterWithdrawal).format("$0,0.00")}
                </Typography>
              </WithdrawalTotalCard>

              <WithdrawalTotalCard>
                <Typography variant="body2" color="text.secondary">
                  Nuevo saldo de caja chica ({branchName}):
                </Typography>
                <Typography variant="subtitle1" color="success.main">
                  {numeral(newPettyCashBalance).format("$0,0.00")}
                </Typography>
              </WithdrawalTotalCard>
            </Stack>

            {exceedsAvailable && (
              <Typography variant="body2" color="error.main" textAlign="center">
                El monto excede el efectivo disponible en la caja de la sucursal
              </Typography>
            )}
          </>
        )}

        <Divider />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleConfirm}
          disabled={submitting || !isFormValid}
        >
          {submitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : isFixedReturn ? (
            "Confirmar devolución"
          ) : (
            "Realizar retiro"
          )}
        </Button>
      </Stack>
    </SideModal>
  );
}
