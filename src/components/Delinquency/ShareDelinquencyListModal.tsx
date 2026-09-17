"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { Link as LinkIcon, Mail as MailIcon } from "@mui/icons-material";
import { X as CloseIcon } from "lucide-react";
import numeral from "numeral";
import { FormTextField } from "@/components/Form";
import { isValidEmail } from "@/forms/validation/schemas/creditApplication";
import {
  addDelinquencySharedListAccess,
  createDelinquencySharedList,
  removeDelinquencySharedListAccess,
} from "@/services/delinquency-shared-list.service";
import type { DelinquencySharedListSummary } from "@/types/delinquency-shared-list.types";
import type { DelinquentCustomer } from "@/types/delinquency.types";
import { useSnackbarStore } from "@/store/useSnackbarStore";

const MAX_FIELD_LENGTH = 64;

export interface ShareDelinquencyListModalProps {
  open: boolean;
  onClose: () => void;
  selectedCustomers?: DelinquentCustomer[];
  existingList?: DelinquencySharedListSummary | null;
  onSuccess?: () => void;
}

function createEmptyEmailField(): string {
  return "";
}

export function ShareDelinquencyListModal({
  open,
  onClose,
  selectedCustomers = [],
  existingList = null,
  onSuccess,
}: ShareDelinquencyListModalProps) {
  const showError = useSnackbarStore((s) => s.showError);
  const showSuccess = useSnackbarStore((s) => s.showSuccess);

  const isExisting = existingList != null;
  const clientCount = isExisting
    ? existingList.clientCount
    : selectedCustomers.length;
  const totalDebt = isExisting
    ? existingList.totalDebtAmount
    : selectedCustomers.reduce((sum, customer) => sum + customer.debtAmount, 0);

  const [clientName, setClientName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [emailFields, setEmailFields] = useState<string[]>([createEmptyEmailField()]);
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [listId, setListId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;

    if (existingList) {
      setClientName(existingList.name);
      setContactEmail(existingList.contactEmail ?? "");
      const contact = existingList.contactEmail?.trim().toLowerCase() ?? "";
      setSavedEmails(
        existingList.accessEmails.filter(
          (email) => email.trim().toLowerCase() !== contact,
        ),
      );
      setEmailFields([createEmptyEmailField()]);
      setShareUrl(existingList.shareUrl);
      setListId(existingList.id);
      return;
    }

    setClientName("");
    setContactEmail("");
    setSavedEmails([]);
    setEmailFields([createEmptyEmailField()]);
    setShareUrl("");
    setListId(null);
  }, [open, existingList]);

  const normalizedContactEmail = contactEmail.trim().toLowerCase();

  const pendingEmails = useMemo(
    () =>
      emailFields
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
        .filter((email) => !savedEmails.includes(email))
        .filter((email) => email !== normalizedContactEmail),
    [emailFields, savedEmails, normalizedContactEmail],
  );

  const canShare = isExisting
    ? pendingEmails.length > 0
    : selectedCustomers.length > 0 &&
      clientName.trim().length > 0 &&
      isValidEmail(contactEmail);

  const handleAddEmailField = useCallback(() => {
    setEmailFields((prev) => [...prev, createEmptyEmailField()]);
  }, []);

  const handleEmailChange = useCallback((index: number, value: string) => {
    setEmailFields((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleRemoveSavedEmail = useCallback(
    async (email: string) => {
      if (!listId) {
        setSavedEmails((prev) => prev.filter((item) => item !== email));
        return;
      }

      setLoading(true);
      try {
        const result = await removeDelinquencySharedListAccess(listId, email);
        if (result.error) {
          showError(result.error.message);
          return;
        }
        const contact = contactEmail.trim().toLowerCase();
        setSavedEmails(
          (result.data?.accessEmails ?? []).filter(
            (item) => item.trim().toLowerCase() !== contact,
          ),
        );
        showSuccess("Acceso removido");
        onSuccess?.();
      } finally {
        setLoading(false);
      }
    },
    [contactEmail, listId, onSuccess, showError, showSuccess],
  );

  const handleShare = useCallback(async () => {
    if (!isExisting) {
      if (!clientName.trim()) {
        showError("Ingresa el nombre del cliente");
        return;
      }
      if (!isValidEmail(contactEmail)) {
        showError("Ingresa un correo electrónico válido");
        return;
      }
    }

    setLoading(true);
    try {
      if (isExisting && listId) {
        if (pendingEmails.length === 0) {
          onClose();
          return;
        }
        const result = await addDelinquencySharedListAccess(listId, pendingEmails);
        if (result.error) {
          showError(result.error.message);
          return;
        }
        const contact = contactEmail.trim().toLowerCase();
        setSavedEmails(
          (result.data?.accessEmails ?? []).filter(
            (item) => item.trim().toLowerCase() !== contact,
          ),
        );
        setEmailFields([createEmptyEmailField()]);
        showSuccess("Accesos actualizados");
        onSuccess?.();
        return;
      }

      const result = await createDelinquencySharedList({
        clientName: clientName.trim(),
        contactEmail: contactEmail.trim(),
        clientIds: selectedCustomers.map((customer) => customer.id),
        emails: pendingEmails,
      });

      if (result.error) {
        showError(result.error.message);
        return;
      }

      setShareUrl(result.data?.shareUrl ?? "");
      setListId(result.data?.id ?? null);
      const contact = (result.data?.contactEmail ?? contactEmail)
        .trim()
        .toLowerCase();
      setSavedEmails(
        (result.data?.accessEmails ?? []).filter(
          (item) => item.trim().toLowerCase() !== contact,
        ),
      );
      setEmailFields([createEmptyEmailField()]);
      showSuccess("Lista compartida correctamente");
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  }, [
    clientName,
    contactEmail,
    isExisting,
    listId,
    onClose,
    onSuccess,
    pendingEmails,
    selectedCustomers,
    showError,
    showSuccess,
  ]);

  const handleCopyLink = useCallback(async () => {
    if (!shareUrl) {
      showError("Comparte la lista primero para obtener el enlace");
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showSuccess("Enlace copiado al portapapeles");
    } catch {
      showError("No se pudo copiar el enlace");
    }
  }, [shareUrl, showError, showSuccess]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <IconButton onClick={onClose} size="small" sx={{ mt: -0.5, ml: -0.5 }}>
            <CloseIcon size={18} />
          </IconButton>
          <Stack alignItems="flex-end" spacing={0.25}>
            <Typography variant="h6" fontWeight={700}>
              ${numeral(totalDebt).format("0,0.00")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Valor de deuda
            </Typography>
          </Stack>
        </Stack>

        <Box>
          <Typography variant="h6" fontWeight={600}>Base de clientes compartida</Typography>
          <Typography variant="body2" color="text.secondary">{numeral(clientCount).format("0,0")} clientes compartidos</Typography>
        </Box>

        <Stack spacing={1.5}>
          <FormTextField
            label="Cliente"
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            placeholder="Nombre del cliente"
            fullWidth
            size="small"
            disabled={isExisting || loading}
            inputProps={{ maxLength: MAX_FIELD_LENGTH }}
          />
          <FormTextField
            label="Email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="Email"
            fullWidth
            size="small"
            type="email"
            disabled={isExisting || loading}
            inputProps={{ maxLength: MAX_FIELD_LENGTH }}
            InputProps={{
              startAdornment: (
                <MailIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
              ),
            }}
          />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2" fontWeight={600}>
            Acceso
          </Typography>

          {savedEmails.map((email) => (
            <Stack key={email} direction="row" spacing={1} alignItems="center">
              <FormTextField
                value={email}
                fullWidth
                size="small"
                disabled
                InputProps={{
                  startAdornment: (
                    <MailIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                  ),
                }}
              />
              <Button
                variant="text"
                color="error"
                onClick={() => void handleRemoveSavedEmail(email)}
                disabled={loading}
                sx={{ whiteSpace: "nowrap" }}
              >
                Remover
              </Button>
            </Stack>
          ))}

          {emailFields.map((email, index) => (
            <FormTextField
              key={`email-field-${index}`}
              value={email}
              onChange={(event) => handleEmailChange(index, event.target.value)}
              placeholder="Email"
              fullWidth
              size="small"
              type="email"
              inputProps={{ maxLength: MAX_FIELD_LENGTH }}
              InputProps={{
                startAdornment: (
                  <MailIcon sx={{ mr: 1, color: "text.secondary", fontSize: 20 }} />
                ),
              }}
            />
          ))}

          <Button
            variant="outlined"
            color="inherit"
            onClick={handleAddEmailField}
            sx={{ alignSelf: "flex-start", bgcolor: "grey.100", borderColor: "grey.300" }}
          >
            Agregar otro
          </Button>
        </Stack>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="contained"
            onClick={() => void handleShare()}
            disabled={loading || !canShare}
          >
            Compartir
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={() => void handleCopyLink()}
            disabled={!shareUrl}
          >
            Copiar link
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
