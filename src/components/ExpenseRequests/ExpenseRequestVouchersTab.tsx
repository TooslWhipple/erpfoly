import { useRef, useState } from "react";
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
  Grid,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Building2,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  FileCode,
  FileImage,
  FileText,
  Info,
  Layers,
  Plus,
  ReceiptText,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import numeral from "numeral";
import { FormDatePicker, FormTextField } from "@/components/Form";
import type {
  CreateExpenseVoucherPayload,
  ExpenseRequestStatus,
  ExpenseVoucher,
  ExpenseVoucherStatus,
} from "@/types/expense-requests.types";
import { formatDate } from "@/utils/date";

export interface ExpenseRequestVouchersTabProps {
  requestStatus: ExpenseRequestStatus;
  vouchers: ExpenseVoucher[];
  onAddVoucher: (payload: CreateExpenseVoucherPayload) => Promise<void>;
  onReviewVoucher: (
    voucherId: number,
    action: "ACCEPT" | "REJECT",
    reason?: string,
  ) => Promise<void>;
  onDeleteVoucher: (voucherId: number) => Promise<void>;
  canAddVouchers?: boolean;
  canReviewVouchers?: boolean;
}

const VOUCHER_STATUS_CHIP: Record<
  ExpenseVoucherStatus,
  { label: string; color: "warning" | "success" | "error" | "default" }
> = {
  PENDING: { label: "Por revisar", color: "warning" },
  ACCEPTED: { label: "Aceptado", color: "success" },
  REJECTED: { label: "Rechazado", color: "error" },
};

export const FORMA_PAGO_MAP: Record<string, string> = {
  "01": "01 - Efectivo",
  "02": "02 - Cheque nominativo",
  "03": "03 - Transferencia electrónica de fondos",
  "04": "04 - Tarjeta de crédito",
  "05": "05 - Monedero electrónico",
  "06": "06 - Dinero electrónico",
  "08": "08 - Vales de despensa",
  "12": "12 - Dación en pago",
  "28": "28 - Tarjeta de débito",
  "29": "29 - Tarjeta de servicios",
  "99": "99 - Por definir",
};

export const METODO_PAGO_MAP: Record<string, string> = {
  PUE: "PUE - Pago en una sola exhibición",
  PPD: "PPD - Pago en parcialidades o diferido",
};

export const USO_CFDI_MAP: Record<string, string> = {
  "G01": "G01 - Adquisición de mercancías",
  "G02": "G02 - Devoluciones, descuentos o bonificaciones",
  "G03": "G03 - Gastos en general",
  "I01": "I01 - Construcciones",
  "I02": "I02 - Mobiliario y equipo de oficina",
  "I03": "I03 - Equipo de transporte",
  "I04": "I04 - Equipo de cómputo y accesorios",
  "I08": "I08 - Otra maquinaria y equipo",
  "D01": "D01 - Honorarios médicos, dentales y gastos hospitalarios",
  "D02": "D02 - Gastos médicos por incapacidad o discapacidad",
  "D04": "D04 - Donativos",
  "P01": "P01 - Por definir",
  "CP01": "CP01 - Pagos",
  "CN01": "CN01 - Nómina",
  "S01": "S01 - Sin efectos fiscales",
};

export interface ParsedClientXml {
  uuid?: string;
  rfcEmisor?: string;
  nombreEmisor?: string;
  formaPago?: string;
  metodoPago?: string;
  usoCfdi?: string;
  total?: number;
  subtotal?: number;
  iva?: number;
  fecha?: string;
  firstConcept?: string;
  concepts: Array<{
    description: string;
    issuerSku?: string | null;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
}

export function parseXmlClient(xmlText: string): ParsedClientXml {
  const result: ParsedClientXml = { concepts: [] };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "application/xml");

    // Timbre Fiscal Digital UUID
    const tfd = doc.querySelector("TimbreFiscalDigital, [UUID]");
    const uuidAttr = tfd?.getAttribute("UUID");
    if (uuidAttr) {
      result.uuid = uuidAttr;
    } else {
      const match = xmlText.match(
        /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
      );
      if (match) result.uuid = match[0];
    }

    // Comprobante (Total, SubTotal, Fecha, FormaPago, MetodoPago)
    const comprobante = doc.querySelector("Comprobante");
    if (comprobante) {
      const totalAttr = comprobante.getAttribute("Total");
      if (totalAttr) result.total = Number.parseFloat(totalAttr);
      const subtotalAttr = comprobante.getAttribute("SubTotal");
      if (subtotalAttr) result.subtotal = Number.parseFloat(subtotalAttr);
      const fechaAttr = comprobante.getAttribute("Fecha");
      if (fechaAttr) result.fecha = fechaAttr.slice(0, 10);
      const formaPagoAttr = comprobante.getAttribute("FormaPago");
      if (formaPagoAttr) result.formaPago = formaPagoAttr;
      const metodoPagoAttr = comprobante.getAttribute("MetodoPago");
      if (metodoPagoAttr) result.metodoPago = metodoPagoAttr;
    }
    if (result.total != null && result.subtotal != null) {
      result.iva = Math.max(
        0,
        Number((result.total - result.subtotal).toFixed(2)),
      );
    }

    // Emisor
    const emisor = doc.querySelector("Emisor");
    if (emisor) {
      result.rfcEmisor = emisor.getAttribute("Rfc") || undefined;
      result.nombreEmisor = emisor.getAttribute("Nombre") || undefined;
    }

    // Receptor (UsoCFDI)
    const receptor = doc.querySelector("Receptor");
    if (receptor) {
      const usoAttr = receptor.getAttribute("UsoCFDI");
      if (usoAttr) result.usoCfdi = usoAttr;
    }

    // Fallbacks via regex
    if (!result.formaPago) {
      const m = xmlText.match(/(?:^|\s)FormaPago\s*=\s*["']([^"']+)["']/i);
      if (m) result.formaPago = m[1];
    }
    if (!result.metodoPago) {
      const m = xmlText.match(/(?:^|\s)MetodoPago\s*=\s*["']([^"']+)["']/i);
      if (m) result.metodoPago = m[1];
    }
    if (!result.usoCfdi) {
      const m = xmlText.match(/(?:^|\s)UsoCFDI\s*=\s*["']([^"']+)["']/i);
      if (m) result.usoCfdi = m[1];
    }

    // Conceptos
    const conceptosNodes = doc.querySelectorAll("Concepto");
    conceptosNodes.forEach((node) => {
      const desc = node.getAttribute("Descripcion") || "";
      const sku = node.getAttribute("NoIdentificacion") || null;
      const qty = Number.parseFloat(node.getAttribute("Cantidad") || "1");
      const unitPrice = Number.parseFloat(
        node.getAttribute("ValorUnitario") || "0",
      );
      const amount = Number.parseFloat(node.getAttribute("Importe") || "0");
      if (desc || sku || amount > 0) {
        result.concepts.push({
          description: desc || sku || "Concepto",
          issuerSku: sku,
          quantity: Number.isFinite(qty) ? qty : 1,
          unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
          amount: Number.isFinite(amount) ? amount : 0,
        });
      }
    });

    if (result.concepts.length > 0) {
      result.firstConcept = result.concepts[0].description;
    }
  } catch (err) {
    console.error("Error al analizar CFDI en cliente:", err);
  }
  return result;
}

export function ExpenseRequestVouchersTab({
  requestStatus,
  vouchers,
  onAddVoucher,
  onReviewVoucher,
  onDeleteVoucher,
  canAddVouchers = true,
  canReviewVouchers = true,
}: ExpenseRequestVouchersTabProps) {
  const muiTheme = useTheme();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVoucherForDetail, setSelectedVoucherForDetail] =
    useState<ExpenseVoucher | null>(null);

  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null,
  );
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);

  // New voucher form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierRfc, setSupplierRfc] = useState("");
  const [fiscalUuid, setFiscalUuid] = useState("");
  const [paymentForm, setPaymentForm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [cfdiUsage, setCfdiUsage] = useState("");
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [xmlParsedData, setXmlParsedData] = useState<ParsedClientXml | null>(
    null,
  );

  const xmlInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const imgInputRef = useRef<HTMLInputElement | null>(null);

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
      if (parsed.firstConcept) {
        setConcept(parsed.firstConcept);
      }
      if (parsed.fecha) {
        setDate(parsed.fecha);
      }
    } catch (err) {
      console.error("Error reading XML file:", err);
    }
  };

  const handleCreateVoucher = async () => {
    // If XML is present, concept and amount are optional (auto-extracted by backend/client)
    let parsedAmount: number | undefined = undefined;
    if (amount.trim()) {
      const num = Number.parseFloat(amount);
      if (Number.isFinite(num) && num > 0) {
        parsedAmount = num;
      }
    }

    if (!xmlFile && (!concept.trim() || !parsedAmount)) {
      return;
    }

    setSubmitting(true);
    try {
      await onAddVoucher({
        date,
        concept: concept.trim() || undefined,
        amount: parsedAmount,
        supplierName: supplierName.trim() || undefined,
        supplierRfc: supplierRfc.trim() || undefined,
        fiscalUuid: fiscalUuid.trim() || undefined,
        paymentForm: paymentForm.trim() || undefined,
        paymentMethod: paymentMethod.trim() || undefined,
        cfdiUsage: cfdiUsage.trim() || undefined,
        xmlFile: xmlFile || undefined,
        pdfFile: pdfFile || undefined,
        imageFile: imageFile || undefined,
      });
      resetForm();
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenReject = (voucherId: number) => {
    setSelectedVoucherId(voucherId);
    setRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedVoucherId || !rejectionReason.trim()) return;
    setSubmitting(true);
    try {
      await onReviewVoucher(selectedVoucherId, "REJECT", rejectionReason.trim());
      setRejectModalOpen(false);
      setSelectedVoucherId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCfdiDetail = (voucher: ExpenseVoucher) => {
    setSelectedVoucherForDetail(voucher);
    setDetailModalOpen(true);
  };

  const handleCopyUuid = (uuid: string) => {
    if (!uuid) return;
    navigator.clipboard.writeText(uuid);
    setCopiedUuid(true);
    setTimeout(() => setCopiedUuid(false), 2000);
  };

  const isCompletedOrCancelled =
    requestStatus === "COMPLETED" ||
    requestStatus === "CANCELLED" ||
    requestStatus === "REJECTED";

  const pendingVouchers = vouchers.filter((v) => v.status === "PENDING");
  const acceptedVouchers = vouchers.filter((v) => v.status === "ACCEPTED");
  const rejectedVouchers = vouchers.filter((v) => v.status === "REJECTED");

  const pendingAmount = pendingVouchers.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );
  const acceptedAmount = acceptedVouchers.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );
  const totalAmount = vouchers.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );

  return (
    <Stack spacing={2.5}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight={700}>
              Comprobantes de Gastos y Facturas ({vouchers.length})
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="nowrap">
              {pendingAmount > 0 && (
                <Chip
                  size="small"
                  icon={<Clock size={13} />}
                  label={`Por revisar: ${numeral(pendingAmount).format("$0,0.00")}`}
                  color="warning"
                  sx={{
                    fontWeight: 700,
                    height: 24,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                />
              )}
              {acceptedAmount > 0 && (
                <Chip
                  size="small"
                  icon={<CheckCircle size={13} />}
                  label={`Aceptado: ${numeral(acceptedAmount).format("$0,0.00")}`}
                  color="success"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    height: 24,
                    fontSize: "0.75rem",
                    whiteSpace: "nowrap",
                  }}
                />
              )}
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Sube CFDIs (XML) con extracción fiscal automática o tickets de compra
            para sustentar la comprobación.
          </Typography>
        </Box>

        {canAddVouchers && !isCompletedOrCancelled && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => setModalOpen(true)}
            size="small"
          >
            Agregar comprobante
          </Button>
        )}
      </Stack>

      {/* KPI Cards: Monto Por Revisar, Monto Aceptado y Total Cargado */}
      {vouchers.length > 0 && (
        <Grid container spacing={1.5} alignItems="stretch">
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex" }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                width: "100%",
                height: "100%",
                minHeight: 84,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(muiTheme.palette.warning.main, 0.5),
                bgcolor: alpha(muiTheme.palette.warning.main, 0.08),
              }}
            >
              <Typography
                variant="caption"
                color="warning.dark"
                fontWeight={700}
                display="block"
                sx={{ minHeight: 20, mb: 0.5, whiteSpace: "nowrap" }}
              >
                Monto por revisar ({pendingVouchers.length})
              </Typography>
              <Typography variant="h6" fontWeight={800} color="warning.dark">
                {numeral(pendingAmount).format("$0,0.00")}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex" }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                width: "100%",
                height: "100%",
                minHeight: 84,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(muiTheme.palette.success.main, 0.4),
                bgcolor: alpha(muiTheme.palette.success.main, 0.06),
              }}
            >
              <Typography
                variant="caption"
                color="success.dark"
                fontWeight={700}
                display="block"
                sx={{ minHeight: 20, mb: 0.5, whiteSpace: "nowrap" }}
              >
                Monto aceptado ({acceptedVouchers.length})
              </Typography>
              <Typography variant="h6" fontWeight={800} color="success.dark">
                {numeral(acceptedAmount).format("$0,0.00")}
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex" }}>
            <Paper
              elevation={0}
              sx={{
                p: 1.75,
                width: "100%",
                height: "100%",
                minHeight: 84,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
                display="block"
                sx={{ minHeight: 20, mb: 0.5, whiteSpace: "nowrap" }}
              >
                Total comprobado ({vouchers.length})
              </Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">
                {numeral(totalAmount).format("$0,0.00")}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

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
            color={muiTheme.palette.text.secondary}
            style={{ opacity: 0.5, marginBottom: 8 }}
          />
          <Typography variant="body2" color="text.secondary">
            No se han subido comprobantes para esta solicitud.
          </Typography>
          {canAddVouchers && !isCompletedOrCancelled && (
            <Button
              sx={{ mt: 1.5 }}
              variant="outlined"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Subir primer comprobante
            </Button>
          )}
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {vouchers.map((voucher) => {
            const chipConfig = VOUCHER_STATUS_CHIP[voucher.status];
            const hasCfdiDetails =
              (voucher.cfdiConcepts && voucher.cfdiConcepts.length > 0) ||
              Boolean(voucher.fiscalUuid);

            return (
              <Box
                key={voucher.id}
                p={2}
                borderRadius={2}
                bgcolor="background.paper"
                border="1px solid"
                borderColor="divider"
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: muiTheme.palette.primary.main,
                    boxShadow: (theme) => theme.shadows[1],
                  },
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Left Column: Concept, Supplier & Fiscal info */}
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {voucher.concept}
                      </Typography>

                      {voucher.supplierName && (
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          <Building2 size={14} color={muiTheme.palette.text.secondary} />
                          <Typography variant="body2" fontWeight={600}>
                            {voucher.supplierName}
                          </Typography>
                          {voucher.supplierRfc && (
                            <Chip
                              label={voucher.supplierRfc}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                                color: muiTheme.palette.primary.main,
                              }}
                            />
                          )}
                        </Stack>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        Fecha: {formatDate(voucher.date, "DD/MM/YYYY")}
                      </Typography>

                      {voucher.fiscalUuid && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.5}
                          sx={{ mt: 0.25 }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "monospace",
                              color: "text.secondary",
                              wordBreak: "break-all",
                            }}
                          >
                            Folio SAT: {voucher.fiscalUuid}
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
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={0.75}
                          flexWrap="wrap"
                          sx={{ mt: 0.5 }}
                        >
                          {voucher.paymentForm && (
                            <Chip
                              size="small"
                              icon={<CreditCard size={12} />}
                              label={`Forma: ${FORMA_PAGO_MAP[voucher.paymentForm] || voucher.paymentForm}`}
                              variant="outlined"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                bgcolor: alpha(muiTheme.palette.info.main, 0.05),
                                borderColor: alpha(muiTheme.palette.info.main, 0.3),
                              }}
                            />
                          )}
                          {voucher.paymentMethod && (
                            <Chip
                              size="small"
                              icon={<Layers size={12} />}
                              label={`Método: ${METODO_PAGO_MAP[voucher.paymentMethod] || voucher.paymentMethod}`}
                              variant="outlined"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                bgcolor: alpha(muiTheme.palette.primary.main, 0.05),
                                borderColor: alpha(muiTheme.palette.primary.main, 0.3),
                              }}
                            />
                          )}
                          {voucher.cfdiUsage && (
                            <Chip
                              size="small"
                              icon={<FileText size={12} />}
                              label={`Uso: ${USO_CFDI_MAP[voucher.cfdiUsage] || voucher.cfdiUsage}`}
                              variant="outlined"
                              sx={{
                                height: 22,
                                fontSize: "0.7rem",
                                fontWeight: 500,
                                bgcolor: alpha(muiTheme.palette.secondary.main, 0.05),
                                borderColor: alpha(muiTheme.palette.secondary.main, 0.3),
                              }}
                            />
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Grid>

                  {/* Financial Breakdown (Amount, Subtotal, IVA) */}
                  <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                    <Stack spacing={0.25}>
                      <Typography variant="h6" fontWeight={700} color="primary.main">
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

                  {/* Status Chip */}
                  <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                    <Chip
                      size="small"
                      label={chipConfig.label}
                      color={chipConfig.color}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Grid>

                  {/* Document & Detail Actions */}
                  <Grid size={{ xs: 12, sm: 5, md: 2.5 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent={{ xs: "flex-start", sm: "flex-end" }}
                      alignItems="center"
                      flexWrap="wrap"
                      gap={0.5}
                    >
                      {/* Botón Ver Detalle Facturado */}
                      {hasCfdiDetails && (
                        <Tooltip title="Ver detalle de conceptos facturados">
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            startIcon={<ReceiptText size={14} />}
                            onClick={() => handleOpenCfdiDetail(voucher)}
                            sx={{
                              fontSize: "0.75rem",
                              textTransform: "none",
                              py: 0.25,
                              px: 1,
                              height: 28,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Ver detalle
                          </Button>
                        </Tooltip>
                      )}

                      {/* File Download Buttons */}
                      {voucher.xmlFileUrl && (
                        <Tooltip title="Descargar XML">
                          <IconButton
                            size="small"
                            component="a"
                            href={voucher.xmlFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            sx={{ p: 0.5 }}
                          >
                            <FileCode size={17} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {voucher.pdfFileUrl && (
                        <Tooltip title="Ver / Descargar PDF">
                          <IconButton
                            size="small"
                            component="a"
                            href={voucher.pdfFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="error"
                            sx={{ p: 0.5 }}
                          >
                            <FileText size={17} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {voucher.imageFileUrl && (
                        <Tooltip title="Ver ticket / imagen">
                          <IconButton
                            size="small"
                            component="a"
                            href={voucher.imageFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="info"
                            sx={{ p: 0.5 }}
                          >
                            <FileImage size={17} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Review Actions */}
                      {canReviewVouchers &&
                        voucher.status === "PENDING" &&
                        !isCompletedOrCancelled && (
                          <>
                            <Tooltip title="Aceptar comprobante">
                              <IconButton
                                size="small"
                                color="success"
                                sx={{ p: 0.5 }}
                                onClick={() =>
                                  onReviewVoucher(voucher.id, "ACCEPT")
                                }
                              >
                                <CheckCircle size={18} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Rechazar comprobante">
                              <IconButton
                                size="small"
                                color="error"
                                sx={{ p: 0.5 }}
                                onClick={() => handleOpenReject(voucher.id)}
                              >
                                <XCircle size={18} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                      {/* Delete */}
                      {!isCompletedOrCancelled && (
                        <Tooltip title="Eliminar comprobante">
                          <IconButton
                            size="small"
                            color="default"
                            sx={{ p: 0.5 }}
                            onClick={() => onDeleteVoucher(voucher.id)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                {voucher.status === "REJECTED" && voucher.rejectionReason && (
                  <Alert severity="error" sx={{ mt: 1.5, py: 0.5 }}>
                    <Typography variant="caption">
                      <strong>Motivo de rechazo:</strong> {voucher.rejectionReason}
                    </Typography>
                  </Alert>
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Modal 1: Subir Comprobante */}
      <Dialog
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptText size={20} color={muiTheme.palette.primary.main} />
            <Typography variant="h6" fontWeight={700}>
              Subir Comprobante de Gasto
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {/* File Upload Section */}
            <Box
              p={2}
              borderRadius={2}
              bgcolor={alpha(muiTheme.palette.primary.main, 0.04)}
              border="1px dashed"
              borderColor="primary.main"
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Archivos del comprobante
              </Typography>

              <Stack spacing={1.5}>
                {/* XML Button */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant={xmlFile ? "contained" : "outlined"}
                    size="small"
                    color="primary"
                    startIcon={<Upload size={14} />}
                    onClick={() => xmlInputRef.current?.click()}
                    sx={{ minWidth: 150 }}
                  >
                    {xmlFile ? "Cambiar XML" : "Adjuntar XML (CFDI)"}
                  </Button>
                  <input
                    type="file"
                    ref={xmlInputRef}
                    accept=".xml,text/xml,application/xml"
                    style={{ display: "none" }}
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

                {/* PDF Button */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant={pdfFile ? "contained" : "outlined"}
                    size="small"
                    color="inherit"
                    startIcon={<Upload size={14} />}
                    onClick={() => pdfInputRef.current?.click()}
                    sx={{ minWidth: 150 }}
                  >
                    {pdfFile ? "Cambiar PDF" : "Adjuntar PDF"}
                  </Button>
                  <input
                    type="file"
                    ref={pdfInputRef}
                    accept=".pdf,application/pdf"
                    style={{ display: "none" }}
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

                {/* Image Button */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Button
                    variant={imageFile ? "contained" : "outlined"}
                    size="small"
                    color="inherit"
                    startIcon={<Upload size={14} />}
                    onClick={() => imgInputRef.current?.click()}
                    sx={{ minWidth: 150 }}
                  >
                    {imageFile ? "Cambiar Imagen" : "Adjuntar Ticket / Foto"}
                  </Button>
                  <input
                    type="file"
                    ref={imgInputRef}
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                  <Typography
                    variant="caption"
                    color={imageFile ? "text.primary" : "text.secondary"}
                    noWrap
                    sx={{ maxWidth: 280 }}
                  >
                    {imageFile ? imageFile.name : "Sin imagen adjunta"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* XML Autodetect Banner */}
            {xmlFile && xmlParsedData && (
              <Alert severity="success" icon={<CheckCircle size={20} />}>
                <Typography variant="subtitle2" fontWeight={700}>
                  CFDI detectado automáticamente
                </Typography>
                <Typography variant="caption" display="block">
                  {xmlParsedData.nombreEmisor && (
                    <>
                      <strong>Proveedor:</strong> {xmlParsedData.nombreEmisor} (
                      {xmlParsedData.rfcEmisor})<br />
                    </>
                  )}
                  {xmlParsedData.uuid && (
                    <>
                      <strong>Folio Fiscal (UUID):</strong> {xmlParsedData.uuid}
                      <br />
                    </>
                  )}
                  {xmlParsedData.total != null && (
                    <>
                      <strong>Monto Total:</strong>{" "}
                      {numeral(xmlParsedData.total).format("$0,0.00")}
                      {xmlParsedData.subtotal != null && (
                        <>
                          {" "}
                          (Subtotal:{" "}
                          {numeral(xmlParsedData.subtotal).format("$0,0.00")} + IVA:{" "}
                          {numeral(xmlParsedData.iva).format("$0,0.00")})
                        </>
                      )}
                      <br />
                    </>
                  )}
                  {xmlParsedData.concepts.length > 0 && (
                    <>
                      <strong>Partidas facturadas:</strong>{" "}
                      {xmlParsedData.concepts.length} concepto(s) extraídos.
                      <br />
                    </>
                  )}
                  {(xmlParsedData.formaPago ||
                    xmlParsedData.metodoPago ||
                    xmlParsedData.usoCfdi) && (
                    <>
                      {xmlParsedData.formaPago && (
                        <>
                          <strong>Forma de pago:</strong>{" "}
                          {FORMA_PAGO_MAP[xmlParsedData.formaPago] ||
                            xmlParsedData.formaPago}
                          <br />
                        </>
                      )}
                      {xmlParsedData.metodoPago && (
                        <>
                          <strong>Método de pago:</strong>{" "}
                          {METODO_PAGO_MAP[xmlParsedData.metodoPago] ||
                            xmlParsedData.metodoPago}
                          <br />
                        </>
                      )}
                      {xmlParsedData.usoCfdi && (
                        <>
                          <strong>Uso de CFDI:</strong>{" "}
                          {USO_CFDI_MAP[xmlParsedData.usoCfdi] ||
                            xmlParsedData.usoCfdi}
                          <br />
                        </>
                      )}
                    </>
                  )}
                </Typography>
              </Alert>
            )}

            {!xmlFile && (
              <Alert severity="info" icon={<Info size={18} />}>
                <Typography variant="caption">
                  Si no cuentas con comprobante fiscal (XML), puedes adjuntar una
                  foto o ticket. En ese caso es <strong>obligatorio capturar el monto y concepto</strong> a mano.
                </Typography>
              </Alert>
            )}

            {/* Form Fields */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker
                  label="Fecha del gasto"
                  value={date}
                  onChange={(val) => setDate(val)}
                  placeholder="DD/MM/YYYY"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label={
                    xmlFile
                      ? "Monto (Auto-detectado del XML)"
                      : "Monto del gasto *"
                  }
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </Grid>
            </Grid>

            <FormTextField
              label={
                xmlFile
                  ? "Concepto del gasto (Auto-detectado del XML)"
                  : "Concepto del gasto *"
              }
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Hospedaje, Alimentos, Casetas"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Proveedor (opcional / auto-detectado)"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Razón Social"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="RFC (opcional / auto-detectado)"
                  value={supplierRfc}
                  onChange={(e) => setSupplierRfc(e.target.value)}
                  placeholder="RFC del emisor"
                />
              </Grid>
            </Grid>

            <FormTextField
              label="Folio Fiscal / UUID SAT (opcional / auto-detectado)"
              value={fiscalUuid}
              onChange={(e) => setFiscalUuid(e.target.value)}
              placeholder="UUID de la factura SAT"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormTextField
                  label="Forma de pago (SAT)"
                  value={
                    paymentForm
                      ? FORMA_PAGO_MAP[paymentForm] || paymentForm
                      : ""
                  }
                  onChange={(e) => setPaymentForm(e.target.value)}
                  placeholder="Ej: 03 - Transferencia"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormTextField
                  label="Método de pago (SAT)"
                  value={
                    paymentMethod
                      ? METODO_PAGO_MAP[paymentMethod] || paymentMethod
                      : ""
                  }
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Ej: PUE - En una sola exhibición"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormTextField
                  label="Uso de CFDI (SAT)"
                  value={
                    cfdiUsage
                      ? USO_CFDI_MAP[cfdiUsage] || cfdiUsage
                      : ""
                  }
                  onChange={(e) => setCfdiUsage(e.target.value)}
                  placeholder="Ej: G03 - Gastos en general"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateVoucher}
            disabled={
              submitting ||
              (!xmlFile && (!concept.trim() || !amount.trim()))
            }
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Guardar Comprobante"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal 2: Detalle de lo facturado (CFDI Conceptos) */}
      <Dialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <ReceiptText size={22} color={muiTheme.palette.primary.main} />
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Detalle de lo Facturado (CFDI)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Información fiscal registrada en la tabla común de CFDIs
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedVoucherForDetail && (
            <Stack spacing={2.5}>
              {/* Header Box: Supplier & Fiscal Data */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(muiTheme.palette.primary.main, 0.04),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Proveedor / Emisor:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {selectedVoucherForDetail.supplierName || "No especificado"}
                    </Typography>
                    {selectedVoucherForDetail.supplierRfc && (
                      <Typography variant="caption" fontWeight={600} color="primary.main">
                        RFC: {selectedVoucherForDetail.supplierRfc}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Fecha del comprobante:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {formatDate(selectedVoucherForDetail.date, "DD/MM/YYYY")}
                    </Typography>
                    {selectedVoucherForDetail.cfdiId && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        ID CFDI Contabilidad: #{selectedVoucherForDetail.cfdiId}
                      </Typography>
                    )}
                  </Grid>

                  {selectedVoucherForDetail.fiscalUuid && (
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 0.5 }} />
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Folio Fiscal SAT (UUID):
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ fontFamily: "monospace", fontWeight: 700 }}
                          >
                            {selectedVoucherForDetail.fiscalUuid}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Copy size={13} />}
                          onClick={() =>
                            handleCopyUuid(selectedVoucherForDetail.fiscalUuid!)
                          }
                          sx={{ textTransform: "none", fontSize: "0.75rem" }}
                        >
                          {copiedUuid ? "Copiado!" : "Copiar UUID"}
                        </Button>
                      </Stack>
                    </Grid>
                  )}

                  {(selectedVoucherForDetail.paymentForm ||
                    selectedVoucherForDetail.paymentMethod ||
                    selectedVoucherForDetail.cfdiUsage) && (
                    <Grid size={{ xs: 12 }}>
                      <Divider sx={{ my: 0.5 }} />
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Forma de Pago:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedVoucherForDetail.paymentForm
                              ? FORMA_PAGO_MAP[selectedVoucherForDetail.paymentForm] ||
                                selectedVoucherForDetail.paymentForm
                              : "No especificada (01 - Efectivo)"}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Método de Pago:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedVoucherForDetail.paymentMethod
                              ? METODO_PAGO_MAP[selectedVoucherForDetail.paymentMethod] ||
                                selectedVoucherForDetail.paymentMethod
                              : "PUE - Pago en una sola exhibición"}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            Uso de CFDI:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {selectedVoucherForDetail.cfdiUsage
                              ? USO_CFDI_MAP[selectedVoucherForDetail.cfdiUsage] ||
                                selectedVoucherForDetail.cfdiUsage
                              : "G03 - Gastos en general"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Paper>

              {/* Concepts Table */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Partidas y Conceptos Facturados (
                  {selectedVoucherForDetail.cfdiConcepts?.length || 0})
                </Typography>

                {selectedVoucherForDetail.cfdiConcepts &&
                selectedVoucherForDetail.cfdiConcepts.length > 0 ? (
                  <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                  >
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "background.default" }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700, width: 60 }}>
                            Cant.
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, width: 110 }}>
                            Clave / SKU
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>
                            Descripción
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, width: 120 }}
                          >
                            P. Unitario
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ fontWeight: 700, width: 120 }}
                          >
                            Importe
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedVoucherForDetail.cfdiConcepts.map((item, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>
                              <Typography variant="caption" fontFamily="monospace">
                                {item.issuerSku || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {item.description}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {numeral(item.unitPrice).format("$0,0.00")}
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              {numeral(item.amount).format("$0,0.00")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box
                    p={3}
                    textAlign="center"
                    bgcolor="background.default"
                    borderRadius={2}
                    border="1px dashed"
                    borderColor="divider"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {selectedVoucherForDetail.concept ||
                        "No hay partidas desglosadas para este comprobante."}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Totals Summary Footer */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(muiTheme.palette.background.default, 0.7),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Grid container spacing={2} justifyContent="flex-end">
                  <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                    <Stack spacing={1}>
                      {selectedVoucherForDetail.subtotal != null && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2" color="text.secondary">
                            Subtotal:
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {numeral(selectedVoucherForDetail.subtotal).format(
                              "$0,0.00",
                            )}
                          </Typography>
                        </Stack>
                      )}

                      {selectedVoucherForDetail.iva != null && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2" color="text.secondary">
                            IVA (16%):
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {numeral(selectedVoucherForDetail.iva).format(
                              "$0,0.00",
                            )}
                          </Typography>
                        </Stack>
                      )}

                      <Divider />

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          Total Facturado:
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="primary.main"
                        >
                          {numeral(selectedVoucherForDetail.amount).format(
                            "$0,0.00",
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal 3: Rechazar Comprobante */}
      <Dialog
        open={rejectModalOpen}
        onClose={() => !submitting && setRejectModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Rechazar Comprobante</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Motivo del rechazo"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Especifica por qué se rechaza este comprobante..."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setRejectModalOpen(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmReject}
            disabled={submitting || !rejectionReason.trim()}
          >
            {submitting ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Confirmar Rechazo"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
