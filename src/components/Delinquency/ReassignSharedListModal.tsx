"use client";

import { useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Stack, Typography } from "@mui/material";
import { ConfirmModal } from "@/components";
import { unwrapOrThrow, type ApiError } from "@/lib/axios";
import { reassignSharedListCollector } from "@/services/delinquency-shared-list.service";
import type {
  DelinquencyListClientConflict,
  DelinquencySharedListSummary,
} from "@/types/delinquency-shared-list.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import { SharedListCollectorSelect } from "./SharedListCollectorSelect";

export interface ReassignSharedListModalProps {
  open: boolean;
  list: DelinquencySharedListSummary | null;
  onClose: () => void;
}

export function ReassignSharedListModal({
  open,
  list,
  onClose,
}: ReassignSharedListModalProps) {
  const queryClient = useQueryClient();
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const [collectorUserId, setCollectorUserId] = useState<number | "">("");
  const [conflicts, setConflicts] = useState<
    DelinquencyListClientConflict[] | null
  >(null);

  const handleClose = useCallback(() => {
    setCollectorUserId("");
    setConflicts(null);
    onClose();
  }, [onClose]);

  const mutation = useMutation({
    mutationFn: async (variables: { listId: number; collectorUserId: number }) =>
      unwrapOrThrow(
        await reassignSharedListCollector(variables.listId, {
          collectorUserId: variables.collectorUserId,
        }),
      ),
    onSuccess: (_data, { listId }) => {
      void queryClient.invalidateQueries({
        queryKey: ["clients", "delinquency", "shared-lists"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["clients", "delinquency", "shared-list", listId],
      });
      showSuccess("Cartera reasignada correctamente");
      handleClose();
    },
    onError: (err) => {
      const apiError = (err as Error & { apiError?: ApiError }).apiError;
      const conflictRows = apiError?.data?.conflicts;
      if (
        apiError?.errorCode === "DELINQUENCY_LIST_CLIENT_CONFLICT" &&
        Array.isArray(conflictRows)
      ) {
        setConflicts(conflictRows as DelinquencyListClientConflict[]);
        return;
      }
      showError(apiError?.message ?? err.message);
    },
  });

  const hasCollector = list?.collector != null;
  const currentLabel = list?.collector?.fullName ?? "Sin gestor";

  const handleConfirm = () => {
    if (list && collectorUserId !== "") {
      mutation.mutate({ listId: list.id, collectorUserId });
    }
  };

  return (
    <ConfirmModal
      open={open}
      onClose={handleClose}
      onConfirm={handleConfirm}
      type="primary"
      title={hasCollector ? "Reasignar cartera" : "Asignar gestor"}
      description={`Gestor actual: ${currentLabel}. Elige el gestor que atenderá la cartera.`}
      confirmLabel="Guardar"
      loading={mutation.isPending}
      confirmDisabled={
        collectorUserId === "" || collectorUserId === list?.collector?.id
      }
    >
      <Stack spacing={2} sx={{ mb: 2 }}>
        <SharedListCollectorSelect
          open={open}
          value={collectorUserId}
          onChange={(value) => {
            setConflicts(null);
            setCollectorUserId(value);
          }}
          disabled={mutation.isPending}
        />
        {conflicts != null && (
          <Alert severity="warning">
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
              Estos clientes ya están en otra cartera activa:
            </Typography>
            <Stack component="ul" sx={{ m: 0, pl: 2 }}>
              {conflicts.map((conflict) => (
                <li key={conflict.clientId}>
                  <Typography variant="body2">
                    {conflict.fullName} — {conflict.listName}
                  </Typography>
                </li>
              ))}
            </Stack>
          </Alert>
        )}
      </Stack>
    </ConfirmModal>
  );
}
