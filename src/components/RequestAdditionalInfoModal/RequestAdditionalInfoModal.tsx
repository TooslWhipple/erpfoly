import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Stack, Typography, Button, CircularProgress } from "@mui/material";
import { SideModal } from "@/components/SideModal";
import {
  Card,
  IconCircle,
  FooterActions,
} from "./styles";
import { Check, FileText, ListTodo } from "lucide-react";
import {
  getAdditionalInformationCatalog,
  requestCreditApplicationAdditionalInformation,
  type AdditionalInformationCatalogItem,
  type AdditionalInformationRequestedItem,
} from "@/services/creditApplications.service";
import { getApiErrorMessage } from "@/lib/axios";
import { useSnackbarStore } from "@/store/useSnackbarStore";

export type AdditionalInfoRequestKind = "file_upload" | "form";

export interface AdditionalInfoRequestOption {
  id: string;
  label: string;
  helperText: string;
  kind: AdditionalInfoRequestKind;
}

export interface RequestAdditionalInfoModalProps {
  applicationId: string;
  requestedItems?: AdditionalInformationRequestedItem[];
  open: boolean;
  onClose: () => void;
}

function mapCatalogItemToOption(item: AdditionalInformationCatalogItem): AdditionalInfoRequestOption {
  const helperTextByKind: Record<AdditionalInfoRequestKind, string> = {
    file_upload: "Se deberá cargar un archivo",
    form: "Se deberá completar un formulario",
  };
  const requestKind: AdditionalInfoRequestKind = item.requestKind === "form" ? "form" : "file_upload";

  return {
    id: item.code,
    label: item.name,
    helperText: item.description?.trim() || helperTextByKind[requestKind],
    kind: requestKind,
  };
}

export function RequestAdditionalInfoModal({
  applicationId,
  requestedItems = [],
  open,
  onClose,
}: RequestAdditionalInfoModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const showSuccess = useSnackbarStore((state) => state.showSuccess);
  const showError = useSnackbarStore((state) => state.showError);

  const requestedCodes = useMemo(
    () =>
      new Set(
        requestedItems
          .filter((item) => item.requestFlag && item.code.trim().length > 0)
          .map((item) => item.code.trim())
      ),
    [requestedItems]
  );

  const {
    data: options = [],
    isPending: catalogLoading,
    isError: catalogError,
    refetch: refetchCatalog,
  } = useQuery({
    queryKey: ["credit-application-additional-information-catalog"],
    queryFn: getAdditionalInformationCatalog,
    enabled: open,
    select: (catalogItems) => catalogItems.map(mapCatalogItemToOption),
  });

  const requestAdditionalInfoMutation = useMutation({
    mutationFn: (codes: string[]) => requestCreditApplicationAdditionalInformation(applicationId, codes),
    onSuccess: () => {
      showSuccess("La solicitud de información adicional se envió correctamente.");
      onClose();
    },
    onError: (error) => {
      showError(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
    }
  }, [open]);

  useEffect(() => {
    setSelectedIds((previousSelection) => {
      const nextSelection = new Set(
        Array.from(previousSelection).filter((code) => !requestedCodes.has(code))
      );
      if (nextSelection.size === previousSelection.size) {
        return previousSelection;
      }
      return nextSelection;
    });
  }, [requestedCodes]);

  const toggleOption = useCallback((id: string) => {
    if (requestedCodes.has(id)) {
      return;
    }
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [requestedCodes]);

  const handleSubmit = useCallback(() => {
    const selectedCodes = Array.from(selectedIds);
    if (selectedCodes.length === 0 || requestAdditionalInfoMutation.isPending) {
      return;
    }
    requestAdditionalInfoMutation.mutate(selectedCodes);
  }, [requestAdditionalInfoMutation, selectedIds]);

  const canSubmit =
    selectedIds.size > 0 &&
    !catalogLoading &&
    !requestAdditionalInfoMutation.isPending &&
    options.length > 0;

  return (
    <SideModal
      open={open}
      onClose={onClose}
      disableClose={requestAdditionalInfoMutation.isPending}
      maxWidth="md"
      title="Solicitar información adicional"
      description="Selecciona los documentos o datos adicionales que deseas solicitar al cliente.">
      <Stack spacing={1.5} sx={{ flex: 1, overflow: "auto", minHeight: 0, pb: 1 }}>
        {catalogLoading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {!catalogLoading && catalogError && (
          <Stack spacing={1.5} alignItems="center" sx={{ py: 6 }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No se pudo cargar el catálogo de información adicional.
            </Typography>
            <Button variant="outlined" onClick={() => void refetchCatalog()}>
              Reintentar
            </Button>
          </Stack>
        )}

        {!catalogLoading && !catalogError && options.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 6 }}>
            No hay información adicional disponible para solicitar.
          </Typography>
        )}

        {!catalogLoading &&
          !catalogError &&
          options.map((option) => {
            const selected = selectedIds.has(option.id);
            const isRequested = requestedCodes.has(option.id);

            return (
              <Card key={option.id} selected={selected}>
                <Stack direction="row" spacing={3} alignItems="center" flexWrap="nowrap">
                  <IconCircle selected={selected}>
                    {
                      selected ?
                        <Check size={18} stroke="2" />
                        :
                        option.kind === "file_upload" ?
                          <FileText size={18} stroke="2" />
                          :
                          <ListTodo size={18} stroke="2" />

                    }
                  </IconCircle>
                  <Stack spacing={0.5}>
                    <Typography variant="subtitle1" fontWeight={600} color="text.primary">{option.label}</Typography>
                    <Typography variant="body2" color="text.secondary">{option.helperText}</Typography>
                  </Stack>
                </Stack>
                <Button
                  variant="outlined"
                  color={isRequested ? "inherit" : "primary"}
                  disabled={isRequested}
                  onClick={() => toggleOption(option.id)}
                >
                  {isRequested ? "Ya solicitado" : selected ? "Quitar" : "Seleccionar"}
                </Button>
              </Card>
            );
          })}
      </Stack>

      <FooterActions>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!canSubmit}
          onClick={handleSubmit}>
          {requestAdditionalInfoMutation.isPending ? <CircularProgress size={20} color="inherit" /> : "Solicitar"}
        </Button>
      </FooterActions>
    </SideModal>
  );
}
