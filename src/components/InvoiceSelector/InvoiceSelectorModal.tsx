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
import type { SelectableInvoice } from "@/types/invoice-selector.types";
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
} from "./InvoiceSelectorModal.styles";

export interface InvoiceSelectorModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (invoices: SelectableInvoice[]) => void | Promise<void>;
    availableInvoices: SelectableInvoice[];
    linkedInvoiceIds?: string[];
    loading?: boolean;
    title?: string;
    maxWidth?: "sm" | "md";
}

export function InvoiceSelectorModal({
    open,
    onClose,
    onConfirm,
    availableInvoices,
    linkedInvoiceIds = [],
    loading = false,
    title = "Agregar facturas",
    maxWidth = "md",
}: InvoiceSelectorModalProps) {
    const theme = useTheme();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const linkedSet = useMemo(() => new Set(linkedInvoiceIds), [linkedInvoiceIds]);

    useEffect(() => {
        if (open) {
            setSelectedIds(new Set());
            setSearchQuery("");
        }
    }, [open]);

    const unlinkedInvoices = useMemo(
        () => availableInvoices.filter((invoice) => !linkedSet.has(invoice.id)),
        [availableInvoices, linkedSet],
    );

    const filteredInvoices = useMemo(() => {
        if (!searchQuery.trim()) return unlinkedInvoices;
        const query = searchQuery.toLowerCase();
        return unlinkedInvoices.filter(
            (invoice) =>
                invoice.externalId.toLowerCase().includes(query) ||
                (invoice.paymentType?.toLowerCase().includes(query) ?? false),
        );
    }, [unlinkedInvoices, searchQuery]);

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
        if (!loading && !submitting) {
            onClose();
        }
    };

    const handleConfirm = async () => {
        if (selectedIds.size === 0) return;
        setSubmitting(true);
        try {
            const selected = unlinkedInvoices.filter((invoice) =>
                selectedIds.has(invoice.id),
            );
            await onConfirm(selected);
        } finally {
            setSubmitting(false);
        }
    };

    const isBusy = loading || submitting;

    return (
        <SideModal
            open={open}
            onClose={handleClose}
            title={title}
            maxWidth={maxWidth}
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
                disabled={loading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search size={18} color={theme.palette.text.secondary} />
                        </InputAdornment>
                    ),
                }}
            />

            <ResultsLabel>
                {loading
                    ? "Buscando facturas..."
                    : `Se encontraron ${filteredInvoices.length} facturas generadas de este proveedor`}
            </ResultsLabel>

            {loading ? (
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
                                        <InvoiceSelectId>ID: {invoice.externalId}</InvoiceSelectId>
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
