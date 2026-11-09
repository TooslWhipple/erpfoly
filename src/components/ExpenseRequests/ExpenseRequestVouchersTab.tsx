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
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  FileCode,
  FileImage,
  FileText,
  Plus,
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

export function ExpenseRequestVouchersTab({
  requestStatus,
  vouchers,
  onAddVoucher,
  onReviewVoucher,
  onDeleteVoucher,
  canAddVouchers = true,
  canReviewVouchers = true,
}: ExpenseRequestVouchersTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New voucher form state
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [concept, setConcept] = useState("");
  const [amount, setAmount] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierRfc, setSupplierRfc] = useState("");
  const [fiscalUuid, setFiscalUuid] = useState("");
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
    setXmlFile(null);
    setPdfFile(null);
    setImageFile(null);
  };

  const handleCreateVoucher = async () => {
    if (!concept.trim() || !amount.trim()) return;
    const num = Number.parseFloat(amount);
    if (!Number.isFinite(num) || num <= 0) return;

    setSubmitting(true);
    try {
      await onAddVoucher({
        date,
        concept: concept.trim(),
        amount: num,
        supplierName: supplierName.trim() || undefined,
        supplierRfc: supplierRfc.trim() || undefined,
        fiscalUuid: fiscalUuid.trim() || undefined,
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

  const isCompletedOrCancelled =
    requestStatus === "COMPLETED" ||
    requestStatus === "CANCELLED" ||
    requestStatus === "REJECTED";

  return (
    <Stack spacing={2.5}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Comprobantes de Gastos ({vouchers.length})
        </Typography>

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

      {vouchers.length === 0 ? (
        <Box
          p={4}
          textAlign="center"
          bgcolor="background.paper"
          borderRadius={2}
          border="1px dashed"
          borderColor="divider"
        >
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
            return (
              <Box
                key={voucher.id}
                p={2}
                borderRadius={2}
                bgcolor="background.paper"
                border="1px solid"
                borderColor="divider"
              >
                <Grid container spacing={1.5} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {voucher.concept}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(voucher.date, "DD/MM/YYYY")}
                      {voucher.supplierName ? ` • ${voucher.supplierName}` : ""}
                    </Typography>
                    {voucher.fiscalUuid && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ wordBreak: "break-all" }}
                      >
                        UUID: {voucher.fiscalUuid}
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {numeral(voucher.amount).format("$0,0.00")}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 2 }}>
                    <Chip
                      size="small"
                      label={chipConfig.label}
                      color={chipConfig.color}
                      variant="outlined"
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Stack direction="row" spacing={1}>
                      {voucher.xmlFileUrl && (
                        <Tooltip title="Descargar XML">
                          <IconButton
                            size="small"
                            component="a"
                            href={voucher.xmlFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                          >
                            <FileCode size={18} />
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
                          >
                            <FileText size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {voucher.imageFileUrl && (
                        <Tooltip title="Ver imagen">
                          <IconButton
                            size="small"
                            component="a"
                            href={voucher.imageFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="info"
                          >
                            <FileImage size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 2 }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      justifyContent="flex-end"
                      alignItems="center"
                    >
                      {canReviewVouchers &&
                        voucher.status === "PENDING" &&
                        !isCompletedOrCancelled && (
                          <>
                            <Tooltip title="Aceptar comprobante">
                              <IconButton
                                size="small"
                                color="success"
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
                                onClick={() => handleOpenReject(voucher.id)}
                              >
                                <XCircle size={18} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                      {!isCompletedOrCancelled && (
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            color="default"
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
                  <Alert severity="error" sx={{ mt: 1, py: 0.25 }}>
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

      {/* Modal Add Voucher */}
      <Dialog
        open={modalOpen}
        onClose={() => !submitting && setModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subir Comprobante de Gasto</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
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
                  label="Monto"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </Grid>
            </Grid>

            <FormTextField
              label="Concepto"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Hospedaje, Alimentos, Casetas"
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="Proveedor (opcional)"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  placeholder="Razón Social"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField
                  label="RFC (opcional)"
                  value={supplierRfc}
                  onChange={(e) => setSupplierRfc(e.target.value)}
                  placeholder="RFC del emisor"
                />
              </Grid>
            </Grid>

            <FormTextField
              label="Folio Fiscal / UUID (opcional)"
              value={fiscalUuid}
              onChange={(e) => setFiscalUuid(e.target.value)}
              placeholder="UUID de la factura SAT"
            />

            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2">Archivos adjuntos</Typography>

            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload size={14} />}
                  onClick={() => xmlInputRef.current?.click()}
                >
                  {xmlFile ? "Cambiar XML" : "Adjuntar XML"}
                </Button>
                <input
                  type="file"
                  ref={xmlInputRef}
                  accept=".xml,text/xml,application/xml"
                  style={{ display: "none" }}
                  onChange={(e) => setXmlFile(e.target.files?.[0] || null)}
                />
                <Typography variant="caption" color="text.secondary">
                  {xmlFile ? xmlFile.name : "Sin archivo"}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload size={14} />}
                  onClick={() => pdfInputRef.current?.click()}
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
                <Typography variant="caption" color="text.secondary">
                  {pdfFile ? pdfFile.name : "Sin archivo"}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload size={14} />}
                  onClick={() => imgInputRef.current?.click()}
                >
                  {imageFile ? "Cambiar Imagen" : "Adjuntar Imagen (ticket)"}
                </Button>
                <input
                  type="file"
                  ref={imgInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <Typography variant="caption" color="text.secondary">
                  {imageFile ? imageFile.name : "Sin archivo"}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateVoucher}
            disabled={submitting || !concept.trim() || !amount.trim()}
          >
            {submitting ? <CircularProgress size={20} /> : "Guardar Comprobante"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Reject Voucher */}
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
            {submitting ? <CircularProgress size={20} /> : "Confirmar Rechazo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
