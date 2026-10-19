import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ScanLine } from "lucide-react";
import { CodeScannerPanel } from "@/components/CodeScannerPanel";
import NumberSpinner from "@/components/NumberSpinner";
import type {
  HandoverInputMethod,
  HandoverLine,
  HandoverSaleDetail,
} from "@/types/saleHandover.types";
import { playScanTone } from "@/utils/playScanTone";
import {
  applyCode,
  blockReasonLabel,
  type CapturedLines,
} from "./handover";
import {
  FeedbackBanner,
  LineCard,
  SectionCard,
} from "./styles";

const HIGHLIGHT_MS = 1600;

type ScanFeedback =
  | { kind: "success"; saleItemId: number; message: string }
  | { kind: "error"; message: string }
  | null;

export interface HandoverSaleViewProps {
  detail: HandoverSaleDetail;
  captured: CapturedLines;
  onCapturedChange: (next: CapturedLines) => void;
  disabled?: boolean;
}

function lineBreakdown(line: HandoverLine): string[] {
  const parts = [`Vendidas: ${line.quantity}`];
  if (line.delivered > 0) parts.push(`entregadas: ${line.delivered}`);
  if (line.released > 0) parts.push(`regularizadas: ${line.released}`);
  if (line.pendingSupply > 0) parts.push(`por surtir: ${line.pendingSupply}`);
  return parts;
}

export function HandoverSaleView({
  detail,
  captured,
  onCapturedChange,
  disabled = false,
}: HandoverSaleViewProps) {
  const [manualCode, setManualCode] = useState("");
  const [feedback, setFeedback] = useState<ScanFeedback>(null);
  const [scannerOn, setScannerOn] = useState(false);

  useEffect(() => {
    if (feedback?.kind !== "success") return;
    const timer = window.setTimeout(() => setFeedback(null), HIGHLIGHT_MS);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const handleCode = (code: string, method: HandoverInputMethod) => {
    if (disabled) return;
    const result = applyCode(detail.lines, captured, code, method);
    if (result.status === "unknown_code") {
      playScanTone("error");
      setFeedback({
        kind: "error",
        message: `El código "${code}" no pertenece a esta venta. No se agregó.`,
      });
      return;
    }
    const line = detail.lines.find((l) => l.saleItemId === result.saleItemId);
    if (result.status === "limit_reached") {
      playScanTone("error");
      setFeedback({
        kind: "error",
        message: `${line?.name ?? "El artículo"}: ya marcaste todas las piezas listas (${result.ready}).`,
      });
      return;
    }
    playScanTone("success");
    onCapturedChange(result.captured);
    setFeedback({
      kind: "success",
      saleItemId: result.saleItemId,
      message: `${line?.name ?? "Artículo"} agregado`,
    });
  };

  const setQuantity = (line: HandoverLine, quantity: number) => {
    const clamped = Math.max(0, Math.min(line.ready, Math.trunc(quantity)));
    const next = { ...captured };
    if (clamped === 0) {
      delete next[line.saleItemId];
    } else {
      next[line.saleItemId] = {
        quantity: clamped,
        inputMethod: captured[line.saleItemId]?.inputMethod ?? "MANUAL",
      };
    }
    onCapturedChange(next);
  };

  if (detail.blockReason) {
    return (
      <Alert severity="warning">{blockReasonLabel(detail.blockReason)}</Alert>
    );
  }

  return (
    <Stack spacing={2}>
      {feedback?.kind === "error" ? (
        <FeedbackBanner role="alert">{feedback.message}</FeedbackBanner>
      ) : null}

      <SectionCard>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              Escanear artículos
            </Typography>
            <Button
              size="small"
              variant={scannerOn ? "outlined" : "contained"}
              startIcon={<ScanLine size={16} aria-hidden />}
              onClick={() => setScannerOn((current) => !current)}
              disabled={disabled}
            >
              {scannerOn ? "Ocultar cámara" : "Usar cámara"}
            </Button>
          </Stack>
          {scannerOn ? (
            <CodeScannerPanel
              enabled={scannerOn && !disabled}
              showMethodSelector={false}
              onCodeScanned={(code) => handleCode(code, "BARCODE")}
            />
          ) : null}
          <TextField
            size="small"
            label="Captura manual del código"
            value={manualCode}
            disabled={disabled}
            onChange={(event) => setManualCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              const code = manualCode.trim();
              if (!code) return;
              handleCode(code, "MANUAL");
              setManualCode("");
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    disabled={disabled || !manualCode.trim()}
                    onClick={() => {
                      handleCode(manualCode.trim(), "MANUAL");
                      setManualCode("");
                    }}
                  >
                    Agregar
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </SectionCard>

      <Stack spacing={1.25}>
        {detail.lines.map((line) => {
          const quantity = captured[line.saleItemId]?.quantity ?? 0;
          const highlighted =
            feedback?.kind === "success" && feedback.saleItemId === line.saleItemId;
          const notReady = line.ready === 0;
          return (
            <LineCard key={line.saleItemId} highlighted={highlighted} muted={notReady}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Box minWidth={0}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {line.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {line.code} · {lineBreakdown(line).join(" · ")}
                  </Typography>
                  <Stack direction="row" spacing={0.75} mt={0.5} flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      color={line.ready > 0 ? "primary" : "default"}
                      variant="outlined"
                      label={`Listas para entregar: ${line.ready}`}
                    />
                    {line.pendingSupply > 0 ? (
                      <Chip size="small" variant="outlined" label="Pendiente por surtir" />
                    ) : null}
                  </Stack>
                </Box>
                {line.ready > 0 ? (
                  <Stack direction="row" spacing={0.75} alignItems="center">
                    <NumberSpinner
                      value={quantity}
                      min={0}
                      max={line.ready}
                      disabled={disabled}
                      decrementAriaLabel={`Quitar una pieza de ${line.name}`}
                      incrementAriaLabel={`Agregar una pieza de ${line.name}`}
                      inputAriaLabel={`Piezas a entregar de ${line.name}`}
                      onChange={(next) => setQuantity(line, next)}
                    />
                    <Button
                      size="small"
                      onClick={() => setQuantity(line, line.ready)}
                      disabled={disabled || quantity >= line.ready}
                    >
                      Todas
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            </LineCard>
          );
        })}
      </Stack>
    </Stack>
  );
}
