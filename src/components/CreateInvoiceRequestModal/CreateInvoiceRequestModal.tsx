import { useEffect, useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { Search, Wallet } from "lucide-react";
import numeral from "numeral";
import { SideModal } from "@/components/SideModal";
import { FileUpload, type UploadedFileItem } from "@/components/FileUpload";
import {
  FormAutocomplete,
  FormSelect,
  FormTextField,
  type SelectOption,
} from "@/components/Form";
import { formatDate } from "@/utils/date";
import { useSnackbarStore } from "@/store/useSnackbarStore";
import {
  createInvoiceRequest,
  getInvoiceOrderOptions,
  getInvoiceSupplierOptions,
  parseInvoiceFile,
} from "@/services/invoice-requests.service";
import type {
  CreateInvoiceRequestPayload,
  InvoicePaymentType,
  ParsedInvoiceFileData,
} from "@/types/invoice-requests.types";
import {
  AmountSummaryCard,
  AmountSummaryRow,
  SupplierToggleRow,
} from "./styles";

type ModalStep = "upload" | "form";

interface FormValues {
  requestingArea: string;
  assignToSupplier: boolean;
  supplierId: string;
  orderId: string;
  paymentDetails: string;
  concept: string;
  invoiceNumber: string;
  paymentType: InvoicePaymentType;
  subtotal: number;
  vat: number;
  total: number;
  issuedAt: string;
  paymentDueAt: string;
}

export interface CreateInvoiceRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INVOICE_FILE_ACCEPT = [
  "application/pdf",
  "application/xml",
  "text/xml",
  ".pdf",
  ".xml",
];

const PAYMENT_TYPE_OPTIONS: SelectOption[] = [
  { value: "PUE", label: "PUE" },
  { value: "PPD", label: "PPD" },
];

const EMPTY_FORM: FormValues = {
  requestingArea: "Administración",
  assignToSupplier: false,
  supplierId: "",
  orderId: "",
  paymentDetails: "",
  concept: "",
  invoiceNumber: "",
  paymentType: "PUE",
  subtotal: 0,
  vat: 0,
  total: 0,
  issuedAt: "",
  paymentDueAt: "",
};

function mapParsedToForm(parsed: ParsedInvoiceFileData): FormValues {
  const suppliers = getInvoiceSupplierOptions();
  const matchedSupplier = suppliers.find(
    (supplier) =>
      supplier.label.toLowerCase() === (parsed.supplierName ?? "").toLowerCase(),
  );

  return {
    requestingArea: parsed.requestingArea,
    assignToSupplier: Boolean(parsed.supplierName),
    supplierId: matchedSupplier?.id ?? "",
    orderId: "",
    paymentDetails: parsed.paymentDetails ?? "",
    concept: parsed.concept,
    invoiceNumber: parsed.invoiceNumber,
    paymentType: parsed.paymentType,
    subtotal: parsed.subtotal,
    vat: parsed.vat,
    total: parsed.total,
    issuedAt: parsed.issuedAt,
    paymentDueAt: parsed.paymentDueAt,
  };
}

function formatDisplayDate(value: string): string {
  if (!value) return "—";
  return formatDate(value, "dateLong");
}

export function CreateInvoiceRequestModal({
  open,
  onClose,
  onSuccess,
}: CreateInvoiceRequestModalProps) {
  const showError = useSnackbarStore((state) => state.showError);
  const showSuccess = useSnackbarStore((state) => state.showSuccess);

  const [step, setStep] = useState<ModalStep>("upload");
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const supplierOptions: SelectOption[] = useMemo(
    () =>
      getInvoiceSupplierOptions().map((supplier) => ({
        value: supplier.id,
        label: supplier.label,
      })),
    [],
  );

  const orderOptions: SelectOption[] = useMemo(
    () =>
      getInvoiceOrderOptions().map((order) => ({
        value: order.id,
        label: order.label,
      })),
    [],
  );

  useEffect(() => {
    if (!open) {
      setStep("upload");
      setFiles([]);
      setFormValues(EMPTY_FORM);
      setFormErrors({});
      setParsing(false);
      setSaving(false);
    }
  }, [open]);

  const handleClose = () => {
    if (parsing || saving) return;
    onClose();
  };

  const handleFilesChange = async (nextFiles: UploadedFileItem[]) => {
    setFiles(nextFiles);
    const file = nextFiles[0]?.file;
    if (!file) {
      setStep("upload");
      setFormValues(EMPTY_FORM);
      return;
    }

    setParsing(true);
    const result = await parseInvoiceFile(file);
    setParsing(false);

    if (result.error || !result.data) {
      showError(result.error?.message ?? "No se pudo leer el archivo de la factura");
      setFiles([]);
      return;
    }

    setFormValues(mapParsedToForm(result.data));
    setFormErrors({});
    setStep("form");
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormValues, string>> = {};

    if (!formValues.concept.trim()) {
      nextErrors.concept = "Ingresa el concepto.";
    }

    if (!formValues.invoiceNumber.trim()) {
      nextErrors.invoiceNumber = "Ingresa el número de factura.";
    }

    if (formValues.total <= 0) {
      nextErrors.total = "El monto total debe ser mayor a cero.";
    }

    if (formValues.assignToSupplier && !formValues.supplierId) {
      nextErrors.supplierId = "Selecciona un proveedor.";
    }

    if (!formValues.assignToSupplier && !formValues.paymentDetails.trim()) {
      nextErrors.paymentDetails = "Ingresa los detalles del pago.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const selectedSupplier = supplierOptions.find(
      (option) => String(option.value) === formValues.supplierId,
    );

    const payload: CreateInvoiceRequestPayload = {
      invoiceNumber: formValues.invoiceNumber.trim(),
      concept: formValues.concept.trim(),
      paymentType: formValues.paymentType,
      subtotal: formValues.subtotal,
      vat: formValues.vat,
      total: formValues.total,
      issuedAt: formValues.issuedAt,
      paymentDueAt: formValues.paymentDueAt,
      requestingArea: formValues.requestingArea,
      assignToSupplier: formValues.assignToSupplier,
      supplierId: formValues.assignToSupplier ? formValues.supplierId : undefined,
      supplierName: formValues.assignToSupplier
        ? selectedSupplier?.label
        : undefined,
      orderId: formValues.assignToSupplier ? formValues.orderId || undefined : undefined,
      paymentDetails: formValues.assignToSupplier
        ? undefined
        : formValues.paymentDetails.trim(),
      fileName: files[0]?.name,
    };

    setSaving(true);
    const result = await createInvoiceRequest(payload);
    setSaving(false);

    if (result.error || !result.data) {
      showError(result.error?.message ?? "No se pudo enviar la solicitud");
      return;
    }

    showSuccess("Solicitud de factura enviada correctamente");
    onSuccess?.();
    onClose();
  };

  const description = (step === "upload")
    ? "Carga la factura en formato XML o PDF"
    : "Complete los detalles de la factura del proveedor";

  return (
    <SideModal
      open={open}
      onClose={handleClose}
      disableClose={parsing || saving}
      maxWidth="sm"
      title="Nueva cuenta por pagar"
      description={description}>
      {
        step === "upload" &&
        <Stack spacing={2} sx={{ height: "100%", flex: 1, minHeight: 0 }}>
          <FileUpload
            value={files}
            onChange={(next) => {
              void handleFilesChange(next);
            }}
            accept={INVOICE_FILE_ACCEPT}
            placeholder="Cargar factura en XML o PDF"
            hint="XML o PDF. Máx. {maxMb} MB."
            disabled={parsing}
            fullHeight
          />

          {
            parsing &&
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Leyendo factura...
              </Typography>
            </Stack>
          }
        </Stack>
      }

      {
        step === "form" &&
        <Stack spacing={2.5}>
          <FormTextField
            label="Área que solicita"
            value={formValues.requestingArea}
            disabled
            InputProps={{ readOnly: true }}
          />

          <SupplierToggleRow>
            <Typography variant="body1">Asignar factura a proveedor</Typography>
            <Switch
              checked={formValues.assignToSupplier}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  assignToSupplier: event.target.checked,
                }))
              }
              color="primary"
            />
          </SupplierToggleRow>

          {
            (formValues.assignToSupplier) ?
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormAutocomplete
                    label="Proveedor"
                    required
                    options={supplierOptions}
                    value={formValues.supplierId}
                    onChange={(value) =>
                      setFormValues((prev) => ({ ...prev, supplierId: value }))
                    }
                    placeholder="Buscar proveedor"
                    error={Boolean(formErrors.supplierId)}
                    helperText={formErrors.supplierId}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormAutocomplete
                    label="Asignar pedido"
                    options={orderOptions}
                    value={formValues.orderId}
                    onChange={(value) =>
                      setFormValues((prev) => ({ ...prev, orderId: value }))
                    }
                    placeholder="Buscar pedido"
                  />
                </Grid>
              </Grid>
              :
              <FormTextField
                label="Detalles del pago"
                required
                value={formValues.paymentDetails}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    paymentDetails: event.target.value,
                  }))
                }
                error={Boolean(formErrors.paymentDetails)}
                helperText={formErrors.paymentDetails}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Search size={18} />
                    </InputAdornment>
                  ),
                }}
              />
          }

          <FormTextField
            label="Concepto"
            required
            value={formValues.concept}
            onChange={(event) =>
              setFormValues((prev) => ({ ...prev, concept: event.target.value }))
            }
            error={Boolean(formErrors.concept)}
            helperText={formErrors.concept}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                label="Número de factura"
                required
                value={formValues.invoiceNumber}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    invoiceNumber: event.target.value,
                  }))
                }
                error={Boolean(formErrors.invoiceNumber)}
                helperText={formErrors.invoiceNumber}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormSelect
                label="Tipo"
                required
                value={formValues.paymentType}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    paymentType: event.target.value as InvoicePaymentType,
                  }))
                }
                options={PAYMENT_TYPE_OPTIONS}
              />
            </Grid>
          </Grid>

          <AmountSummaryCard>
            <Stack direction="row" spacing={1} alignItems="center">
              <Wallet size={16} />
              <Typography variant="subtitle2" fontWeight={700}>MONTO DE LA FACTURA</Typography>
            </Stack>
            <AmountSummaryRow>
              <Typography variant="body2" color="text.secondary">Subtotal (sin IVA)*</Typography>
              <Typography variant="body2">{numeral(formValues.subtotal).format("$0,0.00")}</Typography>
            </AmountSummaryRow>
            <AmountSummaryRow>
              <Typography variant="body2" color="text.secondary">IVA</Typography>
              <Typography variant="body2">{numeral(formValues.vat).format("$0,0.00")}</Typography>
            </AmountSummaryRow>
            <AmountSummaryRow>
              <Typography variant="subtitle1" fontWeight={700}>Total</Typography>
              <Typography variant="subtitle1" fontWeight={700}>{numeral(formValues.total).format("$0,0.00")}</Typography>
            </AmountSummaryRow>
            {
              formErrors.total && <Typography variant="caption" color="error">{formErrors.total}</Typography>
            }
          </AmountSummaryCard>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                label="Fecha de emisión"
                value={formatDisplayDate(formValues.issuedAt)}
                disabled
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormTextField
                label="Fecha de límite de pago"
                value={formatDisplayDate(formValues.paymentDueAt)}
                disabled
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          <Button
            variant="text"
            color="primary"
            onClick={() => {
              setStep("upload");
              setFiles([]);
              setFormValues(EMPTY_FORM);
              setFormErrors({});
            }}
            disabled={saving}>
            Cambiar archivo
          </Button>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={saving || parsing}>
            {
              (saving) ? <CircularProgress size={20} color="inherit" /> : "Enviar solicitud"}
          </Button>
        </Stack>
      }
    </SideModal>
  );
}
