import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Typography,
  Skeleton,
  InputAdornment,
  Alert,
  useTheme,
} from "@mui/material";
import { Search } from "lucide-react";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import type { SupplierWithPendingOrders } from "@/types/recepcion-mercancias.types";
import { formatDateOnly } from "@/utils/date";
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
  InvoiceList,
  InvoiceSelectCard,
  InvoiceCardBody,
  InvoiceCardHeader,
  InvoiceCardTitleRow,
  InvoiceCardFolio,
  InvoiceCardDate,
  InvoiceCardConcept,
  InvoiceCardAmounts,
  InvoiceAmountItem,
  InvoiceAmountLabel,
  InvoiceAmountValue,
  InvoiceLinesList,
  InvoiceLineRow,
  InvoiceLineInfo,
  InvoiceLinePrimary,
  InvoiceLineSecondary,
  InvoiceLineMeta,
  InvoiceCheckbox,
} from "./styles";

const MAX_VISIBLE_LINES = 4;

function formatMoney(value: number): string {
  return numeral(value).format("$0,0.00");
}

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
  const [errorBlocks, setErrorBlocks] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      setStep("suppliers");
      setSelectedSupplier(null);
      setInvoices([]);
      setSelectedInvoiceIds(new Set());
      setBranchId(null);
      setError(null);
      setErrorBlocks([]);
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
    setErrorBlocks([]);
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
    setErrorBlocks([]);
    try {
      const result = await preAuthorizeReception({
        supplier_id: selectedSupplier.id,
        branch_id: branchId,
        order_date: new Date().toISOString().slice(0, 10),
        payable_invoice_ids: [...selectedInvoiceIds],
      });
      if (result.error || !result.data) {
        const blockMessages =
          result.error?.blocks?.map((block) => block.message).filter(Boolean) ??
          [];
        setError(
          result.error?.message ?? "No se pudo preautorizar la recepción",
        );
        setErrorBlocks(blockMessages);
        return;
      }
      await onConfirm(result.data.id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al preautorizar la recepción",
      );
      setErrorBlocks([]);
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
          <Typography variant="body2" fontWeight={600}>
            {error}
          </Typography>
          {errorBlocks.length > 0 ? (
            <Box
              component="ul"
              sx={{ m: 0, mt: 1, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.5 }}
            >
              {errorBlocks.map((blockMessage, index) => (
                <Typography
                  key={`${index}-${blockMessage.slice(0, 24)}`}
                  component="li"
                  variant="body2"
                >
                  {blockMessage}
                </Typography>
              ))}
            </Box>
          ) : null}
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
            <InvoiceList>
              {invoices.map((invoice) => {
                const selected = selectedInvoiceIds.has(invoice.id);
                const lines = invoice.lines ?? [];
                const visibleLines = lines.slice(0, MAX_VISIBLE_LINES);
                const hiddenCount = Math.max(
                  0,
                  lines.length - MAX_VISIBLE_LINES,
                );

                return (
                  <InvoiceSelectCard
                    key={invoice.id}
                    selected={selected}
                    onClick={() => {
                      if (!submitting) toggleInvoice(invoice.id);
                    }}
                  >
                    <InvoiceCheckbox>
                      <Checkbox
                        checked={selected}
                        tabIndex={-1}
                        disableRipple
                        disabled={submitting}
                        onClick={(event) => event.stopPropagation()}
                        onChange={() => toggleInvoice(invoice.id)}
                      />
                    </InvoiceCheckbox>
                    <InvoiceCardBody>
                      <InvoiceCardHeader>
                        <Box sx={{ minWidth: 0 }}>
                          <InvoiceCardTitleRow>
                            <InvoiceCardFolio>
                              {invoice.invoiceNumber}
                            </InvoiceCardFolio>
                            <Chip
                              label={invoice.paymentType}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: "0.6875rem" }}
                            />
                          </InvoiceCardTitleRow>
                          <InvoiceCardDate>
                            {formatDateOnly(invoice.issuedAt, "D MMM YYYY")}
                          </InvoiceCardDate>
                        </Box>
                      </InvoiceCardHeader>

                      {invoice.concept ? (
                        <InvoiceCardConcept>{invoice.concept}</InvoiceCardConcept>
                      ) : null}

                      <InvoiceCardAmounts>
                        <InvoiceAmountItem>
                          <InvoiceAmountLabel>Subtotal</InvoiceAmountLabel>
                          <InvoiceAmountValue>
                            {formatMoney(invoice.subtotal)}
                          </InvoiceAmountValue>
                        </InvoiceAmountItem>
                        <InvoiceAmountItem>
                          <InvoiceAmountLabel>IVA</InvoiceAmountLabel>
                          <InvoiceAmountValue>
                            {formatMoney(invoice.iva)}
                          </InvoiceAmountValue>
                        </InvoiceAmountItem>
                        <InvoiceAmountItem>
                          <InvoiceAmountLabel>Total</InvoiceAmountLabel>
                          <InvoiceAmountValue emphasized>
                            {formatMoney(invoice.total)}
                          </InvoiceAmountValue>
                        </InvoiceAmountItem>
                      </InvoiceCardAmounts>

                      {visibleLines.length > 0 ? (
                        <InvoiceLinesList>
                          {visibleLines.map((line) => (
                            <InvoiceLineRow key={line.id}>
                              <InvoiceLineInfo>
                                <InvoiceLinePrimary>
                                  {line.issuerSku
                                    ? `${line.issuerSku} · ${line.description}`
                                    : line.description}
                                  {line.productId == null
                                    ? " · Sin producto"
                                    : null}
                                </InvoiceLinePrimary>
                                <InvoiceLineSecondary>
                                  {line.quantity} × {formatMoney(line.unitPrice)}
                                </InvoiceLineSecondary>
                              </InvoiceLineInfo>
                              <InvoiceLineMeta>
                                {formatMoney(line.amount)}
                              </InvoiceLineMeta>
                            </InvoiceLineRow>
                          ))}
                          {hiddenCount > 0 ? (
                            <InvoiceLineSecondary>
                              y {hiddenCount} concepto
                              {hiddenCount === 1 ? "" : "s"} más
                            </InvoiceLineSecondary>
                          ) : null}
                        </InvoiceLinesList>
                      ) : null}
                    </InvoiceCardBody>
                  </InvoiceSelectCard>
                );
              })}
            </InvoiceList>
          )}

          <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
            <CreateButton
              variant="outlined"
              disabled={isBusy}
              onClick={() => {
                setStep("suppliers");
                setError(null);
                setErrorBlocks([]);
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
