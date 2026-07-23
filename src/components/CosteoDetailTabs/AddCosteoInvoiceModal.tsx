import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
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
  CosteoAvailableInvoice,
  CosteoInvoiceType,
} from "@/types/costeos.types";

interface AddCosteoInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  availableInvoices: CosteoAvailableInvoice[];
  saving?: boolean;
  onSubmit: (invoiceIds: string[]) => Promise<boolean>;
}

const INVOICE_TYPE_LABELS: Record<CosteoInvoiceType, string> = {
  PUE: "PUE",
  PPD: "PPD",
  credit_note: "Nota de Crédito",
};

export function AddCosteoInvoiceModal({
  open,
  onClose,
  availableInvoices,
  saving = false,
  onSubmit,
}: AddCosteoInvoiceModalProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const toggleInvoice = (invoiceId: string) => {
    setSelectedIds((prev) =>
      prev.includes(invoiceId)
        ? prev.filter((id) => id !== invoiceId)
        : [...prev, invoiceId],
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    await onSubmit(selectedIds);
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
          placeholder="Buscar cliente"
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
          Se encontraron {filteredInvoices.length} facturas generadas de este
          proveedor
        </Typography>

        <Stack divider={<Divider />} spacing={0}>
          {
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
                    <Typography variant="body2" fontWeight={600}>ID: {invoice.externalId}</Typography>
                    <Typography variant="caption" color="text.secondary">{invoice.date}</Typography>
                  </Stack>
                  <Typography variant="body2" flex={1}>Tipo: {INVOICE_TYPE_LABELS[invoice.type]}</Typography>
                  <Typography variant="body2" fontWeight={700}>{numeral(invoice.amount).format("$0,0.00")}</Typography>
                </Stack>
              );
            })}
        </Stack>
      </Stack>
    </SideModal>
  );
}
