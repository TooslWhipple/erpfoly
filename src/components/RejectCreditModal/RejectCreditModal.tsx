import { useCallback, useState } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  Stack,
  Button,
  CircularProgress,
} from "@mui/material";
import { FormTextField } from "@/components/Form";
import { rejectCreditApplication } from "@/services/creditApplications.service";
import type { RejectCreditApplicationResponse } from "@/types/solicitud-credito-detail.types";

export interface RejectCreditModalProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  cooldownMonths?: number;
  /** Called after the API rejects the application successfully */
  onRejectSuccess?: (response: RejectCreditApplicationResponse) => void;
}

export function RejectCreditModal({
  open,
  onClose,
  applicationId,
  cooldownMonths = 6,
  onRejectSuccess,
}: RejectCreditModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  const handleReasonChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setReason(event.target.value);
    },
    [],
  );

  const handleDialogClose = useCallback(() => {
    if (submitting) {
      return;
    }
    onClose();
  }, [onClose, submitting]);

  const handleConfirmReject = async () => {
    const trimmed = reason.trim();
    if (!trimmed || submitting) {
      return;
    }
    setSubmitting(true);
    try {
      const response = await rejectCreditApplication(applicationId, {
        comments: trimmed,
      });
      if (response) {
        onRejectSuccess?.(response);
        onClose();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isReasonValid = reason.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      TransitionProps={{
        onEnter: () => {
          setReason("");
          setSubmitting(false);
        },
      }}
      maxWidth="xs"
      fullWidth
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          justifyContent: "flex-end",
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: "12px",
          overflow: "hidden",
          m: 0,
          mt: 2,
          mr: 2,
        },
      }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h5" fontWeight={600}>
              Rechazar solicitud
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Al realizar esta acción, esta persona no podrá volver a realizar
              una nueva solicitud en {cooldownMonths} meses. El motivo quedará
              registrado en el historial de la solicitud.
            </Typography>
          </Stack>
          <FormTextField
            multiline
            minRows={4}
            fullWidth
            placeholder="Ingresar motivo aquí..."
            value={reason}
            onChange={handleReasonChange}
            disabled={submitting}
          />
          <Button
            variant="contained"
            color="error"
            sx={{ width: "208px" }}
            onClick={() => void handleConfirmReject()}
            disabled={!isReasonValid || submitting}
            startIcon={
              submitting ? (
                <CircularProgress color="inherit" size={18} />
              ) : undefined
            }
          >
            {submitting ? "Rechazando…" : "Sí, rechazar solicitud"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
