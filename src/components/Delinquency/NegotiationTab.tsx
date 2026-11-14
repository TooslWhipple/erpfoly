import { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { FormSelect } from "@/components";
import { TrackSlider } from "@/components/TrackSlider";
import { DELINQUENCY_MANAGEMENT_STATUS_OPTIONS } from "@/constants/delinquency-management-status";
import type { DelinquencyManagementStatus } from "@/types/delinquency-shared-list.types";
import { formatDate } from "@/utils/date";
import { theme } from "@/styles/theme";

const INTEREST_MARKS = [0, 25, 50, 75, 100] as const;

function formatCurrency(value: number): string {
  return numeral(value).format("$0,0.00");
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

export interface NegotiationTabProps {
  principalAmount: number;
  currentDebtAmount: number;
  interestAmount: number;
  maxDiscountAmount: number | null;
  maxDiscountPercent: number | null;
  managementStatus: DelinquencyManagementStatus;
  managementStatusUpdatedAt: string | null;
  updatingStatus?: boolean;
  onManagementStatusChange?: (status: DelinquencyManagementStatus) => void;
  negotiatedInterestAmount: number | null;
  isNegotiated: boolean;
  readOnly?: boolean;
  applying?: boolean;
  onApply?: (negotiatedInterestAmount: number) => Promise<void> | void;
}

export function NegotiationTab({
  principalAmount,
  currentDebtAmount,
  interestAmount,
  maxDiscountAmount,
  maxDiscountPercent,
  managementStatus,
  managementStatusUpdatedAt,
  updatingStatus = false,
  onManagementStatusChange,
  negotiatedInterestAmount,
  isNegotiated,
  readOnly = false,
  applying = false,
  onApply,
}: NegotiationTabProps) {
  const disabled = isNegotiated || readOnly || applying;
  const initialInterest =
    negotiatedInterestAmount != null ? negotiatedInterestAmount : interestAmount;

  const [interestToPay, setInterestToPay] = useState(initialInterest);
  const [inputDraft, setInputDraft] = useState(initialInterest.toFixed(2));

  const minInterestToPay = useMemo(
    () =>
      maxDiscountAmount == null
        ? 0
        : roundMoney(Math.max(0, interestAmount - maxDiscountAmount)),
    [interestAmount, maxDiscountAmount],
  );

  const totalDebt = useMemo(
    () => roundMoney(principalAmount + interestAmount),
    [principalAmount, interestAmount],
  );
  const newDebt = useMemo(
    () => roundMoney(principalAmount + interestToPay),
    [principalAmount, interestToPay],
  );
  const discount = useMemo(
    () => roundMoney(Math.max(0, interestAmount - interestToPay)),
    [interestAmount, interestToPay],
  );

  const percentValue = useMemo(() => {
    if (interestAmount <= 0) return 100;
    return Math.min(
      100,
      Math.max(0, Math.round((interestToPay / interestAmount) * 100)),
    );
  }, [interestAmount, interestToPay]);

  const syncFromPercent = useCallback(
    (percent: number) => {
      const clamped = Math.min(100, Math.max(0, percent));
      const next = roundMoney(
        Math.max((interestAmount * clamped) / 100, minInterestToPay),
      );
      setInterestToPay(next);
      setInputDraft(next.toFixed(2));
    },
    [interestAmount, minInterestToPay],
  );

  const handleSliderChange = useCallback(
    (_: Event, value: number) => {
      syncFromPercent(value);
    },
    [syncFromPercent],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputDraft(event.target.value.replace(/[^\d.]/g, ""));
    },
    [],
  );

  const handleInputBlur = useCallback(() => {
    const parsed = Number.parseFloat(inputDraft);
    if (Number.isNaN(parsed)) {
      setInputDraft(interestToPay.toFixed(2));
      return;
    }
    const clamped = roundMoney(
      Math.min(Math.max(parsed, minInterestToPay), interestAmount),
    );
    setInterestToPay(clamped);
    setInputDraft(clamped.toFixed(2));
  }, [inputDraft, interestAmount, interestToPay, minInterestToPay]);

  const handleApply = async () => {
    if (!onApply || disabled) return;
    await onApply(interestToPay);
  };

  const summaryCards = [
    { label: "Deuda actual", value: currentDebtAmount, highlight: false },
    { label: "Mora asignada", value: interestAmount, highlight: false },
    { label: "Deuda asignada", value: totalDebt, highlight: false },
    { label: "Nueva deuda", value: newDebt, highlight: true },
  ];

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <FormSelect
          label="Estatus de gestión"
          options={DELINQUENCY_MANAGEMENT_STATUS_OPTIONS}
          value={managementStatus}
          disabled={readOnly || updatingStatus}
          onChange={(event) =>
            onManagementStatusChange?.(
              event.target.value as DelinquencyManagementStatus,
            )
          }
        />
        {managementStatusUpdatedAt != null ? (
          <Typography variant="caption" color="text.secondary">
            Actualizado el {formatDate(managementStatusUpdatedAt, "D [de] MMMM, YYYY")}
          </Typography>
        ) : null}
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        useFlexGap
        flexWrap="wrap"
      >
        {summaryCards.map((card) => (
          <Box
            key={card.label}
            sx={{
              flex: { sm: "1 1 140px" },
              minWidth: { sm: 140 },
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.app.border}`,
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {card.label}
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ color: card.highlight ? "primary.main" : "text.primary" }}
            >
              {formatCurrency(card.value)}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: theme.palette.app.sidebar.itemSelected,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "flex-start" }}
          spacing={2}
          mb={2}
        >
          <Stack spacing={0.5} flex={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              Margen de negociación de intereses
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selecciona o ingresa el monto de intereses que el cliente deberá pagar
            </Typography>
          </Stack>
          <TextField
            size="small"
            value={inputDraft}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            disabled={disabled}
            sx={{ width: { xs: "100%", sm: 160 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
        </Stack>

        <TrackSlider
          value={percentValue}
          min={0}
          max={100}
          step={1}
          onChange={handleSliderChange}
          disabled={disabled}
        />
        <Stack direction="row" justifyContent="space-between" mt={0.5}>
          {INTEREST_MARKS.map((mark) => (
            <Typography key={mark} variant="caption" color="text.secondary">
              {mark}%
            </Typography>
          ))}
        </Stack>

        <Typography variant="body2" color="text.secondary" mt={2}>
          Se están descontando{" "}
          <Box component="span" fontWeight={700} color="text.primary">
            {formatCurrency(discount)}
          </Box>{" "}
          de intereses.
        </Typography>

        {!readOnly && maxDiscountAmount != null && maxDiscountPercent != null ? (
          <Typography variant="body2" color="text.secondary" mt={1}>
            Tu tope de descuento: {formatCurrency(maxDiscountAmount)} (
            {maxDiscountPercent}%)
          </Typography>
        ) : null}

        {!readOnly ? (
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            disabled={disabled}
            onClick={() => void handleApply()}
          >
            {applying ? "Aplicando..." : "Aplicar"}
          </Button>
        ) : null}
      </Box>
    </Stack>
  );
}
