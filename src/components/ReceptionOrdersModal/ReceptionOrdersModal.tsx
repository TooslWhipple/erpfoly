import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Typography,
  Skeleton,
  InputAdornment,
  Alert,
  useTheme,
} from "@mui/material";
import { Search } from "lucide-react";
import { SideModal } from "@/components/SideModal";
import type { SupplierWithPendingOrders } from "@/types/recepcion-mercancias.types";
import {
  getAvailablePayableInvoices,
  getPendingArticlesBySupplier,
  getSuppliersWithPendingOrders,
  preAuthorizeReception,
  type AvailablePayableInvoice,
} from "@/services/recepcion-mercancias.service";
import {
  SearchInput,
  SupplierList,
  SupplierCard,
  SupplierCardInfo,
  SupplierCardName,
  SupplierCardLegalName,
  SupplierCardMeta,
  CreateButton,
  EmptyStateContainer,
} from "./styles";

interface ReceptionOrdersModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (receptionId: number) => void | Promise<void>;
  loading?: boolean;
}

type Step = "suppliers" | "invoices";

function formatPendingOrdersLabel(count: number): string {
  if (count === 1) return "1 pedido pendiente";
  return `${count} pedidos pendientes`;
}

export function ReceptionOrdersModal({
  open,
  onClose,
  onConfirm,
  loading = false,
}: ReceptionOrdersModalProps) {
  const theme = useTheme();
  const [step, setStep] = useState<Step>("suppliers");
  const [suppliers, setSuppliers] = useState<SupplierWithPendingOrders[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierWithPendingOrders | null>(null);
  const [invoices, setInvoices] = useState<AvailablePayableInvoice[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [branchId, setBranchId] = useState<number | null>(null);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setStep("suppliers");
      setSelectedSupplier(null);
      setInvoices([]);
      setSelectedInvoiceIds(new Set());
      setBranchId(null);
      setError(null);
      setSearchQuery("");
      setLoadingSuppliers(true);
      getSuppliersWithPendingOrders()
        .then((result) => {
          if (result.error) {
            setSuppliers([]);
            return;
          }
          setSuppliers(result.data ?? []);
        })
        .catch(() => setSuppliers([]))
        .finally(() => setLoadingSuppliers(false));
    }
  }, [open]);

  const filteredSuppliers = useMemo(() => {
    if (!searchQuery.trim()) return suppliers;
    const query = searchQuery.toLowerCase();
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(query) ||
        (supplier.legalName ?? "").toLowerCase().includes(query),
    );
  }, [suppliers, searchQuery]);

  const handleSelectSupplier = async (supplier: SupplierWithPendingOrders) => {
    setSelectedSupplier(supplier);
    setStep("invoices");
    setLoadingInvoices(true);
    setError(null);
    setSelectedInvoiceIds(new Set());
    try {
      const [invoicesResult, articlesResult] = await Promise.all([
        getAvailablePayableInvoices(supplier.id),
        getPendingArticlesBySupplier(supplier.id),
      ]);
      if (invoicesResult.error) {
        setError(invoicesResult.error.message);
        setInvoices([]);
      } else {
        setInvoices(invoicesResult.data ?? []);
      }
      const articles = articlesResult.data ?? [];
      setBranchId(articles[0]?.branchId ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar facturas",
      );
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const toggleInvoice = (invoiceId: number) => {
    setSelectedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(invoiceId)) next.delete(invoiceId);
      else next.add(invoiceId);
      return next;
    });
  };

  const handlePreAuthorize = async () => {
    if (!selectedSupplier || selectedInvoiceIds.size === 0 || branchId == null) {
      setError(
        branchId == null
          ? "El proveedor no tiene pedidos pendientes con sucursal"
          : "Selecciona al menos una factura",
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await preAuthorizeReception({
        supplier_id: selectedSupplier.id,
        branch_id: branchId,
        order_date: new Date().toISOString().slice(0, 10),
        payable_invoice_ids: [...selectedInvoiceIds],
      });
      if (result.error || !result.data) {
        const blocks = (
          result.error as { validationMessages?: string[] } | null
        )?.validationMessages;
        setError(
          blocks?.length
            ? blocks.join(". ")
            : (result.error?.message ?? "No se pudo preautorizar la recepción"),
        );
        return;
      }
      await onConfirm(result.data.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al preautorizar la recepción",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingSuppliers && !submitting && !loadingInvoices) {
      onClose();
    }
  };

  const isBusy =
    loading || loadingSuppliers || submitting || loadingInvoices;

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      title="Nueva recepción de mercancía"
      description={
        step === "suppliers"
          ? "Selecciona el proveedor con mercancía en tránsito"
          : "Selecciona las facturas a preautorizar"
      }
      maxWidth="md"
      disableClose={isBusy}
      contentSx={{ flex: 1, minHeight: 0 }}
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {step === "suppliers" ? (
        <>
          <SearchInput
            placeholder="Buscar proveedor"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            size="small"
            fullWidth
            disabled={loadingSuppliers}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
          />

          {loadingSuppliers ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} variant="rounded" height={72} />
              ))}
            </Box>
          ) : filteredSuppliers.length === 0 ? (
            <EmptyStateContainer>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? "No se encontraron proveedores"
                  : "No hay proveedores con pedidos por recibir"}
              </Typography>
            </EmptyStateContainer>
          ) : (
            <SupplierList>
              {filteredSuppliers.map((supplier) => (
                <SupplierCard key={supplier.id}>
                  <SupplierCardInfo>
                    <SupplierCardName>{supplier.name}</SupplierCardName>
                    <SupplierCardLegalName>
                      {supplier.legalName ?? supplier.name}
                    </SupplierCardLegalName>
                  </SupplierCardInfo>
                  <SupplierCardMeta>
                    {formatPendingOrdersLabel(supplier.pendingOrdersCount)}
                  </SupplierCardMeta>
                  <CreateButton
                    variant="outlined"
                    color="primary"
                    disabled={isBusy || supplier.pendingOrdersCount === 0}
                    onClick={() => handleSelectSupplier(supplier)}
                  >
                    Continuar
                  </CreateButton>
                </SupplierCard>
              ))}
            </SupplierList>
          )}
        </>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle2">
            {selectedSupplier?.name} — facturas pendientes
          </Typography>

          {loadingInvoices ? (
            <CircularProgress size={28} />
          ) : invoices.length === 0 ? (
            <EmptyStateContainer>
              <Typography variant="body2" color="text.secondary">
                No hay facturas disponibles para preautorizar. Aprueba primero
                la solicitud de factura con sus conceptos CFDI.
              </Typography>
            </EmptyStateContainer>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {invoices.map((invoice) => (
                <FormControlLabel
                  key={invoice.id}
                  control={
                    <Checkbox
                      checked={selectedInvoiceIds.has(invoice.id)}
                      onChange={() => toggleInvoice(invoice.id)}
                      disabled={submitting}
                    />
                  }
                  label={`${invoice.invoiceNumber} · $${invoice.total.toLocaleString("es-MX")} · ${invoice.issuedAt}`}
                />
              ))}
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
            <CreateButton
              variant="outlined"
              disabled={isBusy}
              onClick={() => {
                setStep("suppliers");
                setError(null);
              }}
            >
              Atrás
            </CreateButton>
            <CreateButton
              variant="contained"
              color="primary"
              disabled={isBusy || selectedInvoiceIds.size === 0}
              onClick={handlePreAuthorize}
            >
              {submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                "Preautorizar recepción"
              )}
            </CreateButton>
          </Box>
        </Box>
      )}
    </SideModal>
  );
}
