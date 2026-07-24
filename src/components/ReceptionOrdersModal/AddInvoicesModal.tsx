import { useEffect, useMemo, useState } from "react";
import {
  CircularProgress,
  InputAdornment,
  Typography,
  useTheme,
} from "@mui/material";
import { Search } from "lucide-react";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import type { ReceptionInvoice } from "@/types/recepcion-mercancias.types";
import {
  SearchInput,
  ResultsLabel,
  InvoiceList,
  InvoiceSelectCard,
  InvoiceSelectInfo,
  InvoiceSelectMeta,
  InvoiceSelectId,
  InvoiceSelectSecondary,
  InvoiceSelectAmount,
  InvoiceCheckbox,
  EmptyStateContainer,
  HeaderAddButton,
} from "./AddInvoicesModal.styles";

export interface AddInvoicesModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (invoices: ReceptionInvoice[]) => void | Promise<void>;
  /** Invoices already linked to the reception (excluded from selection). */
  linkedInvoiceIds?: string[];
  loading?: boolean;
}

const DUMMY_AVAILABLE_INVOICES: ReceptionInvoice[] = [
  {
    id: "inv-1",
    fiscalFolio: "91212DD3X44",
    date: "18/05/26",
    amount: 197560,
    origin: "ADD",
    paymentType: "PUE",
  },
  {
    id: "inv-2",
    fiscalFolio: "AA9912BB334",
    date: "20/05/26",
    amount: 56000,
    origin: "Correo",
    paymentType: "PUE",
  },
  {
    id: "inv-3",
    fiscalFolio: "ZZ8821CC110",
    date: "22/05/26",
    amount: 253560,
    origin: "ADD",
    paymentType: "PUE",
  },
];

async function getSupplierInvoices(): Promise<ReceptionInvoice[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return DUMMY_AVAILABLE_INVOICES;
}

export function AddInvoicesModal({
  open,
  onClose,
  onConfirm,
  linkedInvoiceIds = [],
  loading = false,
}: AddInvoicesModalProps) {
  const theme = useTheme();
  const [invoices, setInvoices] = useState<ReceptionInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const linkedSet = useMemo(() => new Set(linkedInvoiceIds), [linkedInvoiceIds]);

  useEffect(() => {
    if (open) {
      setLoadingInvoices(true);
      setSelectedIds(new Set());
      setSearchQuery("");
      getSupplierInvoices()
        .then((data) => setInvoices(data))
        .catch((err) => {
          console.error("[AddInvoicesModal] Error fetching invoices:", err);
        })
        .finally(() => setLoadingInvoices(false));
    } else {
      setSelectedIds(new Set());
      setSearchQuery("");
    }
  }, [open]);

  const availableInvoices = useMemo(
    () => invoices.filter((invoice) => !linkedSet.has(invoice.id)),
    [invoices, linkedSet],
  );

  const filteredInvoices = useMemo(() => {
    if (!searchQuery.trim()) return availableInvoices;
    const query = searchQuery.toLowerCase();
    return availableInvoices.filter(
      (invoice) =>
        invoice.fiscalFolio.toLowerCase().includes(query) ||
        (invoice.origin?.toLowerCase().includes(query) ?? false),
    );
  }, [availableInvoices, searchQuery]);

  const handleToggle = (invoiceId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceId)) {
        next.delete(invoiceId);
      } else {
        next.add(invoiceId);
      }
      return next;
    });
  };

  const handleClose = () => {
    if (!loading && !submitting && !loadingInvoices) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      const selected = availableInvoices.filter((invoice) =>
        selectedIds.has(invoice.id),
      );
      await onConfirm(selected);
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = loading || submitting || loadingInvoices;

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Agregar facturas"
      maxWidth="md"
      disableClose={isBusy}
      contentSx={{ flex: 1, minHeight: 0 }}
      headerActions={
        <HeaderAddButton
          variant="contained"
          color="primary"
          disabled={isBusy || selectedIds.size === 0}
          onClick={handleConfirm}
        >
          {submitting ? <CircularProgress size={18} color="inherit" /> : "Agregar"}
        </HeaderAddButton>
      }
    >
      <SearchInput
        placeholder="Buscar por folio fiscal"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        size="small"
        fullWidth
        disabled={loadingInvoices}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search size={18} color={theme.palette.text.secondary} />
            </InputAdornment>
          ),
        }}
      />

      <ResultsLabel>
        {loadingInvoices
          ? "Buscando facturas..."
          : `Se encontraron ${filteredInvoices.length} facturas generadas de este proveedor`}
      </ResultsLabel>

      {loadingInvoices ? (
        <EmptyStateContainer>
          <CircularProgress size={28} />
        </EmptyStateContainer>
      ) : filteredInvoices.length === 0 ? (
        <EmptyStateContainer>
          <Typography variant="body2" color="text.secondary">
            {searchQuery
              ? "No se encontraron facturas"
              : "No hay facturas disponibles para vincular"}
          </Typography>
        </EmptyStateContainer>
      ) : (
        <InvoiceList>
          {filteredInvoices.map((invoice) => {
            const selected = selectedIds.has(invoice.id);
            return (
              <InvoiceSelectCard
                key={invoice.id}
                selected={selected}
                onClick={() => handleToggle(invoice.id)}
              >
                <InvoiceCheckbox
                  checked={selected}
                  tabIndex={-1}
                  disableRipple
                  onClick={(event) => event.stopPropagation()}
                  onChange={() => handleToggle(invoice.id)}
                />
                <InvoiceSelectInfo>
                  <InvoiceSelectMeta>
                    <InvoiceSelectId>ID: {invoice.fiscalFolio}</InvoiceSelectId>
                    <InvoiceSelectSecondary>{invoice.date}</InvoiceSelectSecondary>
                  </InvoiceSelectMeta>
                  <InvoiceSelectMeta>
                    {invoice.origin != null && (
                      <InvoiceSelectSecondary>
                        Origen: {invoice.origin}
                      </InvoiceSelectSecondary>
                    )}
                    {invoice.paymentType != null && (
                      <InvoiceSelectSecondary>
                        Tipo: {invoice.paymentType}
                      </InvoiceSelectSecondary>
                    )}
                  </InvoiceSelectMeta>
                  <InvoiceSelectAmount>
                    {numeral(invoice.amount).format("$0,0.00")}
                  </InvoiceSelectAmount>
                </InvoiceSelectInfo>
              </InvoiceSelectCard>
            );
          })}
        </InvoiceList>
      )}
    </SideModal>
  );
}
