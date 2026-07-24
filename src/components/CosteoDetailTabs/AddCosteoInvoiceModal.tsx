import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { Search } from "lucide-react";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import { FormTextField } from "@/components/Form";
import type {
  AddCosteoInvoicePayload,
  CosteoAvailableInvoice,
  CosteoInvoiceType,
} from "@/types/costeos.types";

interface AddCosteoInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  availableInvoices: CosteoAvailableInvoice[];
  loadingAvailableInvoices?: boolean;
  saving?: boolean;
  onSubmit: (payload: AddCosteoInvoicePayload) => Promise<boolean>;
}

const INVOICE_TYPE_LABELS: Record<CosteoInvoiceType, string> = {
  PUE: "PUE",
  PPD: "PPD",
  CREDIT_NOTE: "Nota de Crédito",
};

export function AddCosteoInvoiceModal({
  open,
  onClose,
  availableInvoices,
  loadingAvailableInvoices = false,
  saving = false,
  onSubmit,
}: AddCosteoInvoiceModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelectedIds([]);
  }, [open]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return availableInvoices;
    return availableInvoices.filter(
      (invoice) =>
        invoice.externalId.toLowerCase().includes(query) ||
        INVOICE_TYPE_LABELS[invoice.type].toLowerCase().includes(query),
    );
  }, [availableInvoices, search]);

  const toggleInvoice = (invoiceId: number) => {
    setSelectedIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    await onSubmit({ supplier_invoice_ids: selectedIds });
  };

  return (
    <SideModal
      open={open}
      onClose={onClose}
      title="Agregar facturas"
      maxWidth="sm"
      headerActions={
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={saving || selectedIds.length === 0}>
          Agregar
        </Button>
      }>
      <Stack spacing={2}>
        <FormTextField
          placeholder="Buscar factura"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          }}
        />

        <Typography variant="body2" color="text.secondary">
          {loadingAvailableInvoices
            ? "Cargando facturas disponibles…"
            : `Se encontraron ${filteredInvoices.length} facturas generadas de este proveedor`}
        </Typography>

        {loadingAvailableInvoices ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack divider={<Divider />} spacing={0}>
            {filteredInvoices.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                py={3}
              >
                No hay facturas disponibles para asociar
              </Typography>
            ) : (
              filteredInvoices.map((invoice) => {
                const checked = selectedIds.includes(invoice.id);
                return (
                  <Stack
                    key={invoice.id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    py={1.5}
                    sx={{ cursor: "pointer" }}
                    onClick={() => toggleInvoice(invoice.id)}>
                    <Checkbox checked={checked} />
                    <Stack spacing={0.25} flex={1}>
                      <Typography variant="body2" fontWeight={600}>
                        ID: {invoice.externalId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {invoice.date}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" flex={1}>
                      Tipo: {INVOICE_TYPE_LABELS[invoice.type]}
                    </Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {numeral(invoice.amount).format("$0,0.00")}
                    </Typography>
                  </Stack>
                );
              })
            )}
          </Stack>
        )}
      </Stack>
    </SideModal>
  );
}
