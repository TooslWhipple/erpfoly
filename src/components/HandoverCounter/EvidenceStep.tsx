import { useRef, useState } from "react";
import { Alert, Button, Chip, Stack, TextField, Typography } from "@mui/material";
import { SignaturePad } from "@/components/SignaturePad";
import type { SignaturePadHandle } from "@/components/SignaturePad";
import { uploadHandoverFile } from "@/services/sale-handover.service";
import { IdPhotoSlot } from "./IdPhotoSlot";
import { RECEIVER_NAME_MAX_LENGTH, isReceiverNameValid } from "./handover";
import { SectionCard } from "./styles";

export interface EvidenceStepProps {
  receiverName: string;
  onReceiverNameChange: (name: string) => void;
  signatureFileId: number | null;
  onSignatureFileIdChange: (fileId: number | null) => void;
  ineFrontFileId: number | null;
  onIneFrontFileIdChange: (fileId: number | null) => void;
  ineBackFileId: number | null;
  onIneBackFileIdChange: (fileId: number | null) => void;
  disabled?: boolean;
}

export function EvidenceStep({
  receiverName,
  onReceiverNameChange,
  signatureFileId,
  onSignatureFileIdChange,
  ineFrontFileId,
  onIneFrontFileIdChange,
  ineBackFileId,
  onIneBackFileIdChange,
  disabled = false,
}: EvidenceStepProps) {
  const padRef = useRef<SignaturePadHandle | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [savingSignature, setSavingSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);

  const nameInvalid = receiverName.length > 0 && !isReceiverNameValid(receiverName);

  const handleDrawnChange = (isDrawn: boolean) => {
    setDrawn(isDrawn);
    // Cualquier trazo posterior invalida la firma ya guardada.
    if (signatureFileId !== null) onSignatureFileIdChange(null);
  };

  const handleSaveSignature = async () => {
    setSignatureError(null);
    setSavingSignature(true);
    const blob = await padRef.current?.toBlob();
    if (!blob) {
      setSavingSignature(false);
      setSignatureError("No se pudo capturar la firma. Intenta de nuevo.");
      return;
    }
    const result = await uploadHandoverFile(blob, "SIGNATURE", "firma.png");
    setSavingSignature(false);
    if (result.error || !result.data) {
      setSignatureError(result.error?.message ?? "No se pudo guardar la firma.");
      return;
    }
    onSignatureFileIdChange(result.data.fileId);
  };

  return (
    <Stack spacing={2}>
      <SectionCard>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            Quien recibe
          </Typography>
          <TextField
            label="Nombre completo de quien recibe"
            value={receiverName}
            disabled={disabled}
            onChange={(event) => onReceiverNameChange(event.target.value)}
            error={nameInvalid}
            helperText={nameInvalid ? "Mínimo 2 caracteres." : undefined}
            inputProps={{ maxLength: RECEIVER_NAME_MAX_LENGTH }}
            required
            fullWidth
          />
        </Stack>
      </SectionCard>

      <SectionCard>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={700}>
            Identificación (opcional)
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <IdPhotoSlot
              label="INE frente"
              kind="INE_FRONT"
              fileId={ineFrontFileId}
              onFileIdChange={onIneFrontFileIdChange}
              disabled={disabled}
            />
            <IdPhotoSlot
              label="INE reverso"
              kind="INE_BACK"
              fileId={ineBackFileId}
              onFileIdChange={onIneBackFileIdChange}
              disabled={disabled}
            />
          </Stack>
        </Stack>
      </SectionCard>

      <SectionCard>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={700}>
              Firma de quien recibe
            </Typography>
            {signatureFileId !== null ? (
              <Chip size="small" color="success" label="Guardada" />
            ) : (
              <Chip size="small" color="warning" label="Obligatoria" />
            )}
          </Stack>
          <SignaturePad
            ref={padRef}
            disabled={disabled || savingSignature}
            onDrawnChange={handleDrawnChange}
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => padRef.current?.clear()}
              disabled={disabled || savingSignature || !drawn}
            >
              Borrar
            </Button>
            <Button
              variant="contained"
              onClick={() => void handleSaveSignature()}
              disabled={
                disabled || savingSignature || !drawn || signatureFileId !== null
              }
            >
              {savingSignature ? "Guardando..." : "Guardar firma"}
            </Button>
          </Stack>
          {signatureError ? <Alert severity="error">{signatureError}</Alert> : null}
        </Stack>
      </SectionCard>
    </Stack>
  );
}
