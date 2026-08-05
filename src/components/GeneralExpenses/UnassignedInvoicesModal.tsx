import { useMemo } from "react";
import {
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import type { UnassignedInvoice } from "@/types/general-expenses.types";
import { InvoiceCard, InvoiceMetaRow } from "./styles";

export interface UnassignedInvoicesModalProps {
  open: boolean;
  onClose: () => void;
  invoices: UnassignedInvoice[];
  loading?: boolean;
  registeringId?: string | null;
  onRegisterExpense: (invoice: UnassignedInvoice) => void;
}

export function UnassignedInvoicesModal({
  open,
  onClose,
  invoices,
  loading = false,
  registeringId = null,
  onRegisterExpense,
}: UnassignedInvoicesModalProps) {
  const isBusy = Boolean(registeringId);

  const content = useMemo(() => {
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" py={6} spacing={2}>
          <CircularProgress size={28} />
          <Typography variant="body2" color="text.secondary">
            Cargando facturas sin asignar...
          </Typography>
        </Stack>
      );
    }

    if (invoices.length === 0) {
      return (
        <Stack alignItems="center" justifyContent="center" py={6}>
          <Typography variant="body2" color="text.secondary">
            No hay facturas pendientes de asignar
          </Typography>
        </Stack>
      );
    }

    return (
      <Stack spacing={1.5}>
        {invoices.map((invoice) => (
          <InvoiceCard key={invoice.id}>
            <Stack spacing={1} flex={1} minWidth={0}>
              <InvoiceMetaRow>
                <Stack spacing={0.25} minWidth={0}>
                  <Typography variant="subtitle2" noWrap>
                    {invoice.supplierName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    RFC: {invoice.supplierRfc}
                  </Typography>
                </Stack>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  disabled={isBusy}
                  onClick={() => onRegisterExpense(invoice)}
                  startIcon={
                    registeringId === invoice.id ? (
                      <CircularProgress size={14} color="inherit" />
                    ) : undefined
                  }
                >
                  Registrar gasto
                </Button>
              </InvoiceMetaRow>
              <InvoiceMetaRow>
                <Typography variant="body2" color="text.secondary">
                  {invoice.date}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tipo: {invoice.paymentType}
                </Typography>
                <Typography variant="subtitle2">
                  {numeral(invoice.amount).format("$0,0.00")}
                </Typography>
              </InvoiceMetaRow>
            </Stack>
          </InvoiceCard>
        ))}
      </Stack>
    );
  }, [invoices, isBusy, loading, onRegisterExpense, registeringId]);

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Facturas sin gasto asignadas"
      description="Se identificaron las siguientes facturas sin un gasto asignado aún."
      maxWidth="md"
      disableClose={isBusy}
      headerActions={
        <Button
          variant="contained"
          color="primary"
          disabled={isBusy || invoices.length === 0}
          onClick={onClose}
        >
          Registrar
        </Button>
      }
      headerActionsPosition="top"
    >
      {content}
    </SideModal>
  );
}
