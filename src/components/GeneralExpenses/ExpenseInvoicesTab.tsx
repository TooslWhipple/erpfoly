import { useRef, useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AlertTriangle,
  Building2,
  CheckCircle,
  Copy,
  CreditCard,
  FileCode,
  FileImage,
  FileText,
  Layers,
  Plus,
  ReceiptText,
  Trash2,
  Upload,
} from "lucide-react";
import numeral from "numeral";
import { FormDatePicker, FormTextField } from "@/components/Form";
import {
  FORMA_PAGO_MAP,
  METODO_PAGO_MAP,
  USO_CFDI_MAP,
  type ParsedClientXml,
  parseXmlClient,
} from "@/components/ExpenseRequests/ExpenseRequestVouchersTab";
import type { SupplierSelectOption } from "@/hooks/suppliers/useSuppliersSelect";
import type { UnassignedInvoice } from "@/types/general-expenses.types";
import { InvoiceCard, InvoiceMetaRow } from "./styles";

export interface ExpenseCapturedVoucher {
  id: string;
  date: string;
  concept: string;
  amount: number;
  subtotal?: number;
  iva?: number;
  isDeductible: boolean;
  supplierName?: string;
  supplierRfc?: string;
  fiscalUuid?: string;
  paymentForm?: string;
  paymentMethod?: string;
  cfdiUsage?: string;
  concepts?: Array<{
    description: string;
    issuerSku?: string | null;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  xmlFile?: File | null;
  pdfFile?: File | null;
  imageFile?: File | null;
  xmlUrl?: string | null;
  pdfUrl?: string | null;
  imageUrl?: string | null;
}

export interface ExpenseInvoicesTabProps {
  vouchers: ExpenseCapturedVoucher[];
  onAddVoucher: (voucher: ExpenseCapturedVoucher) => void;
  onRemoveVoucher: (voucherId: string) => void;
  onToggleVoucherDeductible?: (voucherId: string) => void;
  availableInvoices?: UnassignedInvoice[];
  searching?: boolean;
  searchMessage?: string;
  onAddAvailableInvoice?: (invoice: UnassignedInvoice) => void;
  disabled?: boolean;
  selectedSupplier?: SupplierSelectOption | null;
}

export function ExpenseInvoicesTab({
  vouchers,
  onAddVoucher,
  onRemoveVoucher,
  onToggleVoucherDeductible,
  availableInvoices = [],
  searching = false,
  searchMessage,
  onAddAvailableInvoice,
  disabled = false,
  selectedSupplier = null,
}: ExpenseInvoicesTabProps) {
  const theme = useTheme();

  // Modal de captura
  const [modalOpen, setModalOpen] = useState(false);
  const [conceptsModalOpen, setConceptsModalOpen] = useState(false);
  const [selectedVoucherForDetail, setSelectedVoucherForDetail] =
    useState<ExpenseCapturedVoucher | null>(null);
  const [copiedUuid, setCopiedUuid] = useState(false);

  // Form State dentro del Modal
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().split("T")[0],
  );
  const [concept, setConcept] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [supplierName, setSupplierName] = useState<string>("");
  const [supplierRfc, setSupplierRfc] = useState<string>("");
  const [fiscalUuid, setFiscalUuid] = useState<string>("");
  const [paymentForm, setPaymentForm] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [cfdiUsage, setCfdiUsage] = useState<string>("");
  const [isDeductible, setIsDeductible] = useState<boolean>(true);
  const [subtotal, setSubtotal] = useState<number | undefined>(undefined);
  const [iva, setIva] = useState<number | undefined>(undefined);
  const [parsedConcepts, setParsedConcepts] = useState<
    ExpenseCapturedVoucher["concepts"]
  >([]);

  // Archivos seleccionados en el Modal
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [xmlParsedData, setXmlParsedData] = useState<ParsedClientXml | null>(
    null,
  );

  const xmlInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imgInputRef = useRef<HTMLInputElement | null>(null);

  // Totales acumulados
  const totalAmount = useMemo(
    () => vouchers.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [vouchers],
  );
  const deductibleAmount = useMemo(
    () =>
      vouchers
        .filter((v) => v.isDeductible)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [vouchers],
  );
  const nonDeductibleAmount = useMemo(
    () =>
      vouchers
        .filter((v) => !v.isDeductible)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
    [vouchers],
  );

  // Validación de RFC del emisor contra el proveedor seleccionado en el gasto
  const rfcMismatchWarning = useMemo(() => {
    if (!supplierRfc || !selectedSupplier?.rfc) return null;
    const cleanXmlRfc = supplierRfc.trim().toUpperCase();
    const cleanSupplierRfc = selectedSupplier.rfc.trim().toUpperCase();
    if (cleanXmlRfc && cleanSupplierRfc && cleanXmlRfc !== cleanSupplierRfc) {
      return {
        xmlRfc: cleanXmlRfc,
        supplierRfc: cleanSupplierRfc,
        supplierName: selectedSupplier.label,
      };
    }
    return null;
  }, [supplierRfc, selectedSupplier]);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setConcept("");
    setAmount("");
    setSupplierName("");
    setSupplierRfc("");
    setFiscalUuid("");
    setPaymentForm("");
    setPaymentMethod("");
    setCfdiUsage("");
    setIsDeductible(true);
    setSubtotal(undefined);
    setIva(undefined);
    setParsedConcepts([]);
    setXmlFile(null);
    setPdfFile(null);
    setImageFile(null);
    setXmlParsedData(null);
  };

  const handleXmlSelected = async (file: File | null) => {
    setXmlFile(file);
    if (!file) {
      setXmlParsedData(null);
      return;
    }
    try {
      const text = await file.text();
      const parsed = parseXmlClient(text);
      setXmlParsedData(parsed);

      if (parsed.uuid) setFiscalUuid(parsed.uuid);
      if (parsed.nombreEmisor) setSupplierName(parsed.nombreEmisor);
      if (parsed.rfcEmisor) setSupplierRfc(parsed.rfcEmisor);
      if (parsed.formaPago) setPaymentForm(parsed.formaPago);
      if (parsed.metodoPago) setPaymentMethod(parsed.metodoPago);
      if (parsed.usoCfdi) setCfdiUsage(parsed.usoCfdi);
      if (parsed.total != null && Number.isFinite(parsed.total)) {
        setAmount(String(parsed.total));
      }
      if (parsed.subtotal != null) setSubtotal(parsed.subtotal);
      if (parsed.iva != null) setIva(parsed.iva);
      if (parsed.firstConcept) setConcept(parsed.firstConcept);
      if (parsed.fecha) setDate(parsed.fecha);
      if (parsed.concepts?.length > 0) setParsedConcepts(parsed.concepts);

      // Con XML, por defecto es deducible (a menos que el usuario lo cambie)
      setIsDeductible(true);
    } catch (err) {
      console.error("Error reading XML:", err);
    }
  };

  const handleCreateVoucher = () => {
    const numAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return;
    }

    const newVoucher: ExpenseCapturedVoucher = {
      id: `vouch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: date || new Date().toISOString().split("T")[0],
      concept:
        concept.trim() ||
        xmlParsedData?.firstConcept ||
        "Comprobante de gasto",
      amount: numAmount,
      subtotal: subtotal,
      iva: iva,
      // Si no lleva XML, es automáticamente no deducible; si lleva XML, toma la opción del switch
      isDeductible: xmlFile ? isDeductible : false,
      supplierName:
        supplierName.trim() ||
        xmlParsedData?.nombreEmisor ||
        selectedSupplier?.label,
      supplierRfc: supplierRfc.trim() || xmlParsedData?.rfcEmisor,
      fiscalUuid: fiscalUuid.trim() || xmlParsedData?.uuid,
      paymentForm: paymentForm.trim() || xmlParsedData?.formaPago,
      paymentMethod: paymentMethod.trim() || xmlParsedData?.metodoPago,
      cfdiUsage: cfdiUsage.trim() || xmlParsedData?.usoCfdi,
      concepts: parsedConcepts,
      xmlFile,
      pdfFile,
      imageFile,
    };

    onAddVoucher(newVoucher);
    resetForm();
    setModalOpen(false);
  };

  const handleCopyUuid = (uuid: string) => {
    if (!uuid) return;
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  const handleOpenCfdiDetail = (voucher: ExpenseCapturedVoucher) => {
    setSelectedVoucherForDetail(voucher);
    setConceptsModalOpen(true);
  };

  // Facturas disponibles en administración que aún no han sido añadidas
  const voucherUuids = new Set(
    vouchers.map((v) => v.fiscalUuid).filter(Boolean),
  );
  const addable = availableInvoices.filter(
    (inv) => !voucherUuids.has(inv.invoiceNumber),
  );

  return (
    <Stack spacing={2.5}>
      {/* Top Header & Actions */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1.5}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Comprobantes de Gastos y Facturas ({vouchers.length})
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Carga comprobantes con XML (CFDI) o tickets de compra. Los importes
            se sumarán automáticamente al monto a pagar del gasto.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Plus size={16} />}
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          disabled={disabled}
          size="small"
        >
          Agregar comprobante
        </Button>
      </Stack>

      {/* KPI Cards: Total a Pagar, Deducible, No Deducible */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              Total Monto a Pagar ({vouchers.length})
            </Typography>
            <Typography variant="h5" fontWeight={800} color="primary.main">
              {numeral(totalAmount).format("$0,0.00")}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.success.main, 0.4),
              bgcolor: alpha(theme.palette.success.main, 0.06),
            }}
          >
            <Typography
              variant="caption"
              color="success.dark"
              fontWeight={700}
            >
              Deducible con CFDI ({vouchers.filter((v) => v.isDeductible).length})
            </Typography>
            <Typography variant="h5" fontWeight={800} color="success.dark">
              {numeral(deductibleAmount).format("$0,0.00")}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.warning.main, 0.4),
              bgcolor: alpha(theme.palette.warning.main, 0.06),
            }}
          >
            <Typography
              variant="caption"
              color="warning.dark"
              fontWeight={700}
            >
              No Deducible ({vouchers.filter((v) => !v.isDeductible).length})
            </Typography>
            <Typography variant="h5" fontWeight={800} color="warning.dark">
              {numeral(nonDeductibleAmount).format("$0,0.00")}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de Comprobantes Cargados */}
      {vouchers.length === 0 ? (
        <Box
          p={4}
          textAlign="center"
          bgcolor="background.paper"
          borderRadius={2}
          border="1px dashed"
          borderColor="divider"
        >
          <ReceiptText
            size={40}
            color={theme.palette.text.secondary}
            style={{ opacity: 0.5, marginBottom: 8 }}
          />
          <Typography variant="body2" color="text.secondary">
            No has agregado comprobantes ni facturas a este gasto.
          </Typography>
          <Button
            sx={{ mt: 1.5 }}
            variant="outlined"
            size="small"
            startIcon={<Plus size={16} />}
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            disabled={disabled}
          >
            Agregar primer comprobante
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {vouchers.map((voucher) => {
            const hasCfdiDetails =
              Boolean(voucher.concepts && voucher.concepts.length > 0) ||
              Boolean(voucher.paymentForm || voucher.paymentMethod);

            return (
              <Box
                key={voucher.id}
                p={2}
                borderRadius={2}
                border="1px solid"
                borderColor="divider"
                bgcolor="background.paper"
              >
                <Grid container spacing={1.5} alignItems="center">
                  {/* Info Principal: Fecha, Concepto, Emisor */}
                  <Grid size={{ xs: 12, sm: 5, md: 5 }}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" color="text.secondary">
                          {voucher.date}
                        </Typography>
                        {voucher.isDeductible ? (
                          <Chip
                            size="small"
                            label="Deducible (CFDI)"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 600, height: 20, fontSize: "0.7rem" }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            label="No deducible"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 600, height: 20, fontSize: "0.7rem" }}
                          />
                        )}
                      </Stack>

                      <Typography variant="subtitle2" fontWeight={600}>
                        {voucher.concept}
                      </Typography>

                      {(voucher.supplierName || voucher.supplierRfc) && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          flexWrap="wrap"
                        >
                          <Building2 size={13} opacity={0.6} />
                          <Typography variant="caption" color="text.secondary">
                            {voucher.supplierName || "Proveedor"}
                            {voucher.supplierRfc && ` • RFC: ${voucher.supplierRfc}`}
                          </Typography>
                        </Stack>
                      )}

                      {voucher.fiscalUuid && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              bgcolor: alpha(theme.palette.divider, 0.1),
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: "0.72rem",
                            }}
                          >
                            UUID: {voucher.fiscalUuid}
                          </Typography>
                          <Tooltip title="Copiar Folio Fiscal UUID">
                            <IconButton
                              size="small"
                              sx={{ p: 0.25 }}
                              onClick={() => handleCopyUuid(voucher.fiscalUuid!)}
                            >
                              <Copy size={12} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}

                      {(voucher.paymentForm || voucher.paymentMethod || voucher.cfdiUsage) && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                          {voucher.paymentForm && (
                            <Chip
                              size="small"
                              icon={<CreditCard size={11} />}
                              label={`Forma: ${FORMA_PAGO_MAP[voucher.paymentForm] || voucher.paymentForm}`}
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.68rem" }}
                            />
                          )}
                          {voucher.paymentMethod && (
                            <Chip
                              size="small"
                              icon={<Layers size={11} />}
                              label={`Método: ${METODO_PAGO_MAP[voucher.paymentMethod] || voucher.paymentMethod}`}
                              variant="outlined"
                              sx={{ height: 20, fontSize: "0.68rem" }}
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Grid>

                  {/* Importes: Total, Subtotal, IVA */}
                  <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                    <Stack spacing={0.25}>
                      <Typography variant="h6" fontWeight={800} color="primary.main">
                        {numeral(voucher.amount).format("$0,0.00")}
                      </Typography>
                      {voucher.subtotal != null && (
                        <Typography variant="caption" color="text.secondary">
                          Subtotal: {numeral(voucher.subtotal).format("$0,0.00")}
                          {voucher.iva != null && (
                            <> • IVA: {numeral(voucher.iva).format("$0,0.00")}</>
                          )}
                        </Typography>
                      )}
                    </Stack>
                  </Grid>

                  {/* Acciones y Archivos */}
                  <Grid size={{ xs: 12, sm: 3, md: 3 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                      alignItems="center"
                    >
                      {hasCfdiDetails && (
                        <Tooltip title="Ver detalle de conceptos">
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            startIcon={<ReceiptText size={13} />}
                            onClick={() => handleOpenCfdiDetail(voucher)}
                            sx={{
                              fontSize: "0.72rem",
                              textTransform: "none",
                              py: 0.25,
                              px: 0.75,
                              height: 28,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Ver detalle
                          </Button>
                        </Tooltip>
                      )}

                      {/* Iconos de archivo */}
                      {voucher.xmlFile && (
                        <Tooltip title={`XML: ${voucher.xmlFile.name}`}>
                          <IconButton size="small" color="primary">
                            <FileCode size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {voucher.pdfFile && (
                        <Tooltip title={`PDF: ${voucher.pdfFile.name}`}>
                          <IconButton size="small" color="error">
                            <FileText size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {voucher.imageFile && (
                        <Tooltip title={`Ticket: ${voucher.imageFile.name}`}>
                          <IconButton size="small" color="info">
                            <FileImage size={16} />
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="Eliminar comprobante">
                        <IconButton
                          size="small"
                          color="error"
                          disabled={disabled}
                          onClick={() => onRemoveVoucher(voucher.id)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Facturas disponibles para vincular desde administración */}
      {(searching || searchMessage) && (
        <Stack direction="row" spacing={1} alignItems="center">
          {searching && <CircularProgress size={16} />}
          <Typography variant="body2" color="text.secondary">
            {searching
              ? "Buscando facturas disponibles en administración"
              : searchMessage}
          </Typography>
        </Stack>
      )}

      {addable.length > 0 && (
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            Facturas pendientes en cuentas por pagar ({addable.length})
          </Typography>
          {addable.map((invoice) => (
            <InvoiceCard key={invoice.id}>
              <Stack spacing={0.75} flex={1} minWidth={0}>
                <InvoiceMetaRow>
                  <Typography variant="body2" fontWeight={600}>
                    {invoice.invoiceNumber ?? invoice.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoice.date}
                  </Typography>
                </InvoiceMetaRow>
                <InvoiceMetaRow>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {invoice.supplierName}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">
                      {numeral(invoice.amount).format("$0,0.00")}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={disabled || !onAddAvailableInvoice}
                      onClick={() => onAddAvailableInvoice?.(invoice)}
                    >
                      Vincular
                    </Button>
                  </Stack>
                </InvoiceMetaRow>
              </Stack>
            </InvoiceCard>
          ))}
        </Stack>
      )}

      {/* =========================================================================
          MODAL: AGREGAR COMPROBANTE (Captura idéntica a Solicitud de Gastos)
         ========================================================================= */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptText size={20} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={700}>
              Subir Comprobante de Gasto
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {/* Sección de carga de archivos */}
            <Box
              p={2}
              borderRadius={2}
              bgcolor={alpha(theme.palette.primary.main, 0.04)}
              border="1px dashed"
              borderColor="primary.main"
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Archivos del comprobante
              </Typography>

              <Stack spacing={1.5}>
                {/* Botón XML */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant={xmlFile ? "contained" : "outlined"}
                    size="small"
                    color="primary"
                    startIcon={<Upload size={14} />}
                    onClick={() => xmlInputRef.current?.click()}
                    sx={{ minWidth: 160 }}
                  >
                    {xmlFile ? "Cambiar XML" : "Adjuntar XML (CFDI)"}
                  </Button>
                  <input
                    type="file"
                    ref={xmlInputRef}
                    accept=".xml,text/xml,application/xml"
                    hidden
                    onChange={(e) =>
                      void handleXmlSelected(e.target.files?.[0] || null)
                    }
                  />
                  <Typography
                    variant="caption"
                    color={xmlFile ? "primary.main" : "text.secondary"}
                    fontWeight={xmlFile ? 600 : 400}
                    noWrap
                    sx={{ maxWidth: 280 }}
                  >
                    {xmlFile ? xmlFile.name : "Sin archivo XML"}
                  </Typography>
                </Stack>

                {/* Botón PDF */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant={pdfFile ? "contained" : "outlined"}
                    size="small"
                    color="inherit"
                    startIcon={<Upload size={14} />}
                    onClick={() => pdfInputRef.current?.click()}
                    sx={{ minWidth: 160 }}
                  >
                    {pdfFile ? "Cambiar PDF" : "Adjuntar PDF"}
                  </Button>
                  <input
                    type="file"
                    ref={pdfInputRef}
                    accept=".pdf,application/pdf"
                    hidden
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <Typography
                    variant="caption"
                    color={pdfFile ? "text.primary" : "text.secondary"}
                    noWrap
                    sx={{ maxWidth: 280 }}
                  >
                    {pdfFile ? pdfFile.name : "Sin archivo PDF"}
                  </Typography>
                </Stack>

                {/* Botón Imagen/Ticket */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant={imageFile ? "contained" : "outlined"}
                    size="small"
                    color="inherit"
                    startIcon={<Upload size={14} />}
                    onClick={() => imgInputRef.current?.click()}
                    sx={{ minWidth: 160 }}
                  >
                    {imageFile ? "Cambiar Ticket" : "Adjuntar Ticket / Foto"}
                  </Button>
                  <input
                    type="file"
                    ref={imgInputRef}
                    accept="image/*,.pdf"
                    hidden
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <Typography
                    variant="caption"
                    color={imageFile ? "text.primary" : "text.secondary"}
                    noWrap
                    sx={{ maxWidth: 280 }}
                  >
                    {imageFile ? imageFile.name : "Sin ticket adjunto"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Banner de autodetección de XML */}
            {xmlFile && xmlParsedData && (
              <Alert severity="success" icon={<CheckCircle size={20} />}>
                <Typography variant="subtitle2" fontWeight={700}>
                  CFDI detectado y parseado correctamente
                </Typography>
                <Typography variant="caption" display="block">
                  {xmlParsedData.nombreEmisor &&
                    `Emisor: ${xmlParsedData.nombreEmisor}`}
                  {xmlParsedData.rfcEmisor && ` (${xmlParsedData.rfcEmisor})`}
                  {xmlParsedData.total != null &&
                    ` • Total: ${numeral(xmlParsedData.total).format("$0,0.00")}`}
                  {xmlParsedData.concepts.length > 0 &&
                    ` • ${xmlParsedData.concepts.length} concepto(s)`}
                </Typography>
              </Alert>
            )}

            {/* Alerta de validación de RFC Emisor contra Proveedor Seleccionado */}
            {rfcMismatchWarning && (
              <Alert severity="warning" icon={<AlertTriangle size={20} />}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Advertencia de validación de RFC Emisor
                </Typography>
                <Typography variant="caption" display="block">
                  El RFC emisor de la factura (
                  <strong>{rfcMismatchWarning.xmlRfc}</strong>) no coincide con el
                  RFC del proveedor seleccionado en el gasto (
                  <strong>
                    {rfcMismatchWarning.supplierName} - {rfcMismatchWarning.supplierRfc}
                  </strong>
                  ).
                </Typography>
              </Alert>
            )}

            {/* Switch de Deducibilidad del Gasto */}
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(
                  isDeductible
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  0.05,
                ),
                borderColor: alpha(
                  isDeductible
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  0.3,
                ),
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {isDeductible
                      ? "Gasto marcado como Deducible"
                      : "Gasto marcado como NO Deducible"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {!xmlFile
                      ? "Al no contener XML, este comprobante se registrará como no deducible."
                      : isDeductible
                        ? "El XML fiscal se contabilizará para efectos fiscales de la empresa."
                        : "Aunque cuenta con XML, se registrará como gasto no deducible a solicitud del usuario."}
                  </Typography>
                </Box>
                <Switch
                  checked={isDeductible}
                  onChange={(_, checked) => setIsDeductible(checked)}
                  color="success"
                  disabled={!xmlFile} // Si no hay XML, forzosamente no es deducible
                />
              </Stack>
            </Paper>

            {/* Campos de captura (prellenados si hay XML) */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker
                  label="Fecha del comprobante"
                  value={date}
                  onChange={(val) => setDate(val)}
                  placeholder="DD/MM/YYYY"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Monto ($ MXN) *"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormTextField
                  label="Concepto / Descripción *"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej. Combustible, papelería, alimentos..."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Proveedor / Emisor (opcional)"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Nombre o razón social"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="RFC Emisor (opcional)"
                  value={supplierRfc}
                  onChange={(e) => setSupplierRfc(e.target.value)}
                  placeholder="XAXX010101000"
                />
              </Grid>

              {fiscalUuid && (
                <Grid size={{ xs: 12 }}>
                  <FormTextField
                    label="Folio Fiscal SAT (UUID)"
                    value={fiscalUuid}
                    onChange={(e) => setFiscalUuid(e.target.value)}
                    placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                  />
                </Grid>
              )}
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setModalOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateVoucher}
            disabled={!amount || Number.parseFloat(amount) <= 0}
          >
            Agregar Comprobante
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Conceptos Facturados del CFDI */}
      <Dialog
        open={conceptsModalOpen}
        onClose={() => setConceptsModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptText size={20} color={theme.palette.primary.main} />
            <Typography variant="h6" fontWeight={700}>
              Conceptos Facturados en el CFDI
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVoucherForDetail?.concepts &&
          selectedVoucherForDetail.concepts.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Descripción</TableCell>
                    <TableCell>No. Identificación</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Precio Unitario</TableCell>
                    <TableCell align="right">Importe</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedVoucherForDetail.concepts.map((concept, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {concept.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{concept.issuerSku || "—"}</TableCell>
                      <TableCell align="right">{concept.quantity}</TableCell>
                      <TableCell align="right">
                        {numeral(concept.unitPrice).format("$0,0.00")}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {numeral(concept.amount).format("$0,0.00")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No se encontraron conceptos detallados en el comprobante.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConceptsModalOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
