"use client";

import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { X as CloseIcon } from "lucide-react";
import numeral from "numeral";
import { getApiErrorMessage, unwrapOrThrow } from "@/lib/axios";
import { createDelinquencySharedList } from "@/services/delinquency-shared-list.service";
import type {
  CreateDelinquencySharedListPayload,
  DelinquencyListClientConflict,
} from "@/types/delinquency-shared-list.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { SharedListCollectorSelect } from "./SharedListCollectorSelect";

export interface ShareDelinquencyListModalProps {
  open: boolean;
  onClose: () => void;
  clientCount?: number;
  totalDebt?: number;
  selectionPayload?: Pick<CreateDelinquencySharedListPayload, "clientIds" | "selection">;
  onSuccess?: () => void;
}

export function ShareDelinquencyListModal({
  open,
  onClose,
  clientCount = 0,
  totalDebt = 0,
  selectionPayload,
  onSuccess,
}: ShareDelinquencyListModalProps) {
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const [collectorUserId, setCollectorUserId] = useState<number | "">("");
  const [excludedClients, setExcludedClients] = useState<
    DelinquencyListClientConflict[] | null
  >(null);

  const handleClose = useCallback(() => {
    setCollectorUserId("");
    setExcludedClients(null);
    onClose();
  }, [onClose]);

  const createMutation = useMutation({
    mutationFn: async (variables: { collectorUserId: number }) =>
      unwrapOrThrow(
        await createDelinquencySharedList({
          collectorUserId: variables.collectorUserId,
          ...selectionPayload,
        }),
      ),
    onSuccess: (response) => {
      onSuccess?.();
      if (response.excludedClients.length === 0) {
        showSuccess("Lista compartida correctamente");
        handleClose();
        return;
      }
      setExcludedClients(response.excludedClients);
    },
    onError: (err) => {
      showError(getApiErrorMessage(err));
    },
  });

  const loading = createMutation.isPending;
  const created = excludedClients != null;
  const canShare = !created && clientCount > 0 && collectorUserId !== "";

  const handleShare = useCallback(() => {
    if (collectorUserId === "") return;
    createMutation.mutate({ collectorUserId });
  }, [collectorUserId, createMutation]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack direction="column" alignItems="flex-start">
          <IconButton onClick={handleClose} size="small">
            <CloseIcon size={18} />
          </IconButton>

          <Stack width="100%" direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack>
              <Typography variant="h6" fontWeight={600}>Base de clientes compartida</Typography>
              <Typography variant="body2" color="text.secondary">{numeral(clientCount).format("0,0")} clientes compartidos</Typography>
            </Stack>
            <Stack alignItems="flex-end" spacing={0.25}>
              <Typography variant="h6" fontWeight={700}>${numeral(totalDebt).format("0,0.00")}</Typography>
              <Typography variant="caption" color="text.secondary">Valor de deuda</Typography>
            </Stack>
          </Stack>
        </Stack>

        <SharedListCollectorSelect
          open={open}
          value={collectorUserId}
          onChange={setCollectorUserId}
          disabled={loading || created}
        />

        {excludedClients != null && (
          <Alert severity="warning">
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
              La lista se creó, pero estos clientes ya están en otra cartera activa y se excluyeron:
            </Typography>
            <Stack component="ul" sx={{ m: 0, pl: 2 }}>
              {excludedClients.map((client) => (
                <li key={client.clientId}>
                  <Typography variant="body2">
                    {client.fullName} — {client.listName}
                  </Typography>
                </li>
              ))}
            </Stack>
          </Alert>
        )}

        <Stack direction="row" spacing={1.5} alignItems="center">
          {created ? (
            <Button variant="contained" onClick={handleClose}>
              Cerrar
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleShare}
              disabled={loading || !canShare}
            >
              Compartir
            </Button>
          )}
        </Stack>
      </Stack>
    </Dialog>
  );
}
