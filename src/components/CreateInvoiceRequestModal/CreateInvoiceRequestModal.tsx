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
  getSuppliersWithOrders,
  parseInvoiceFile,
} from "@/services/invoice-requests.service";
import type {
  CreateInvoiceRequestPayload,
  InvoicePaymentType,
  InvoiceSupplierWithOrdersOption,
  ParsedInvoiceFileData,
} from "@/types/invoice-requests.types";
import {
  AmountSummaryCard,
  AmountSummaryRow,
  SupplierToggleRow,
} from "./styles";

type ModalStep = "uploadXml" | "uploadPdf" | "form";

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
  cfdiId: string;
  cfdiUuid: string;
}

export interface CreateInvoiceRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const XML_ACCEPT = ["application/xml", "text/xml", ".xml"];
const PDF_ACCEPT = ["application/pdf", ".pdf"];

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
  cfdiId: "",
  cfdiUuid: "",
};

function mapParsedToForm(
  parsed: ParsedInvoiceFileData,
  suppliers: InvoiceSupplierWithOrdersOption[],
): FormValues {
  const matchedSupplier = suppliers.find(
    (supplier) =>
      supplier.label.toLowerCase() === (parsed.supplierName ?? "").toLowerCase(),
  );

  return {
    requestingArea: parsed.requestingArea || "Administración",
    assignToSupplier: Boolean(matchedSupplier),
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
    cfdiId: parsed.cfdiId ?? "",
    cfdiUuid: parsed.cfdiUuid ?? "",
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
  const showInfo = useSnackbarStore((state) => state.showInfo);

  const [step, setStep] = useState<ModalStep>("uploadXml");
  const [xmlFiles, setXmlFiles] = useState<UploadedFileItem[]>([]);
  const [pdfFiles, setPdfFiles] = useState<UploadedFileItem[]>([]);
  const [formValues, setFormValues] = useState<FormValues>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [suppliers, setSuppliers] = useState<InvoiceSupplierWithOrdersOption[]>(
    [],
  );

  const supplierOptions: SelectOption[] = useMemo(
    () =>
      suppliers.map((supplier) => ({
        value: supplier.id,
        label: supplier.label,
      })),
    [suppliers],
  );

  const orderOptions: SelectOption[] = useMemo(() => {
    const selected = suppliers.find((s) => s.id === formValues.supplierId);
    return (selected?.orders ?? []).map((order) => ({
      value: order.id,
      label: order.label,
    }));
  }, [suppliers, formValues.supplierId]);

  const xmlFile = xmlFiles[0]?.file ?? null;
  const pdfFile = pdfFiles[0]?.file ?? null;

  useEffect(() => {
    if (!open) {
      setStep("uploadXml");
      setXmlFiles([]);
      setPdfFiles([]);
      setFormValues(EMPTY_FORM);
      setFormErrors({});
      setParsing(false);
      setSaving(false);
      return;
    }

    let cancelled = false;
    setLoadingSuppliers(true);
    void getSuppliersWithOrders().then((result) => {
      if (cancelled) return;
      setLoadingSuppliers(false);
      if (result.error || !result.data) {
        showError(
          result.error?.message ??
            "No se pudieron cargar proveedores con pedidos",
        );
        setSuppliers([]);
        return;
      }
      setSuppliers(result.data);
    });

    return () => {
      cancelled = true;
    };
  }, [open, showError]);

  const handleClose = () => {
    if (parsing || saving) return;
    onClose();
  };

  const handleXmlChange = (nextFiles: UploadedFileItem[]) => {
    setXmlFiles(nextFiles);
  };

  const handlePdfChange = (nextFiles: UploadedFileItem[]) => {
    setPdfFiles(nextFiles);
  };

  const handleProcessFiles = async (options?: { skipPdf?: boolean }) => {
    if (!xmlFile) {
      showError("Carga el archivo XML de la factura");
      return;
    }

    const includePdf = !options?.skipPdf && Boolean(pdfFile);
    const filesToSend = includePdf && pdfFile ? [xmlFile, pdfFile] : [xmlFile];

    setParsing(true);
    const result = await parseInvoiceFile(filesToSend);
    setParsing(false);

    if (result.error || !result.data) {
      showError(
        result.error?.message ?? "No se pudo leer el archivo de la factura",
      );
      return;
    }

    if (!result.data.cfdiId || !result.data.cfdiUuid) {
      showError("No se recibieron las referencias del CFDI");
      return;
    }

    if (result.data.alreadyExists) {
      showInfo(
        "Este CFDI ya estaba registrado en contabilidad. Se reutilizaron sus datos.",
      );
    }

    setFormValues(mapParsedToForm(result.data, suppliers));
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

    if (!formValues.cfdiId || !formValues.cfdiUuid) {
      nextErrors.invoiceNumber = "Debes procesar el XML antes de enviar.";
    }

    if (formValues.total <= 0) {
      nextErrors.total = "El monto total debe ser mayor a cero.";
    }

    if (formValues.assignToSupplier && !formValues.supplierId) {
      nextErrors.supplierId = "Selecciona un proveedor.";
    }

    if (formValues.assignToSupplier && !formValues.orderId) {
      nextErrors.orderId = "Selecciona un pedido.";
    }

    if (!formValues.assignToSupplier && !formValues.paymentDetails.trim()) {
      nextErrors.paymentDetails = "Ingresa los detalles del pago.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateInvoiceRequestPayload = {
      invoiceNumber: formValues.invoiceNumber.trim(),
      concept: formValues.concept.trim(),
      paymentType: formValues.paymentType,
      requestingArea: formValues.requestingArea,
      assignToSupplier: formValues.assignToSupplier,
      supplierId: formValues.assignToSupplier
        ? Number(formValues.supplierId)
        : undefined,
      orderId: formValues.assignToSupplier
        ? Number(formValues.orderId)
        : undefined,
      paymentDetails: formValues.assignToSupplier
        ? undefined
        : formValues.paymentDetails.trim(),
      cfdiId: formValues.cfdiId,
      cfdiUuid: formValues.cfdiUuid,
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

  const description =
    step === "uploadXml"
      ? "Carga el XML de la factura (obligatorio)"
      : step === "uploadPdf"
        ? "Agrega el PDF de representación impresa (opcional)"
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
        step === "uploadXml" &&
        <Stack spacing={2} sx={{ height: "100%", flex: 1, minHeight: 0 }}>
          <FileUpload
            value={xmlFiles}
            onChange={handleXmlChange}
            accept={XML_ACCEPT}
            maxFiles={1}
            placeholder="Cargar factura en XML"
            hint="Solo XML. Máx. {maxMb} MB."
            disabled={parsing}
            fullHeight
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => setStep("uploadPdf")}
            disabled={!xmlFile}
            sx={{ py: 1.5, mt: "auto" }}>
            Continuar
          </Button>
        </Stack>
      }

      {
        step === "uploadPdf" &&
        <Stack spacing={2} sx={{ height: "100%", flex: 1, minHeight: 0 }}>
          {
            xmlFile &&
            <Typography variant="body2" color="text.secondary">
              XML cargado: <strong>{xmlFile.name}</strong>
            </Typography>
          }

          <FileUpload
            value={pdfFiles}
            onChange={handlePdfChange}
            accept={PDF_ACCEPT}
            maxFiles={1}
            placeholder="Cargar PDF (opcional)"
            hint="PDF opcional. Máx. {maxMb} MB."
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

          <Stack spacing={1} sx={{ mt: "auto" }}>
            <Button
              variant="text"
              color="primary"
              onClick={() => {
                setStep("uploadXml");
                setPdfFiles([]);
              }}
              disabled={parsing}>
              Volver al XML
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={() => {
                setPdfFiles([]);
                void handleProcessFiles({ skipPdf: true });
              }}
              disabled={parsing}
              sx={{ py: 1.5 }}>
              Omitir PDF
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => {
                void handleProcessFiles();
              }}
              disabled={parsing}
              sx={{ py: 1.5 }}>
              {
                parsing
                  ? <CircularProgress size={20} color="inherit" />
                  : "Continuar"
              }
            </Button>
          </Stack>
        </Stack>
      }

      {
        step === "form" &&
        <Stack spacing={2.5} sx={{ pb: 1 }}>
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
                  supplierId: event.target.checked ? prev.supplierId : "",
                  orderId: event.target.checked ? prev.orderId : "",
                  paymentDetails: event.target.checked
                    ? ""
                    : prev.paymentDetails,
                }))
              }
              color="primary"
            />
          </SupplierToggleRow>

          {
            formValues.assignToSupplier ?
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormAutocomplete
                    label="Proveedor"
                    required
                    options={supplierOptions}
                    value={formValues.supplierId}
                    onChange={(value) =>
                      setFormValues((prev) => ({
                        ...prev,
                        supplierId: value,
                        orderId: "",
                      }))
                    }
                    placeholder={
                      loadingSuppliers
                        ? "Cargando proveedores..."
                        : "Buscar proveedor"
                    }
                    error={Boolean(formErrors.supplierId)}
                    helperText={formErrors.supplierId}
                    disabled={loadingSuppliers}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormAutocomplete
                    label="Asignar pedido"
                    required
                    options={orderOptions}
                    value={formValues.orderId}
                    onChange={(value) =>
                      setFormValues((prev) => ({ ...prev, orderId: value }))
                    }
                    placeholder={
                      formValues.supplierId
                        ? "Buscar pedido"
                        : "Selecciona un proveedor"
                    }
                    error={Boolean(formErrors.orderId)}
                    helperText={formErrors.orderId}
                    disabled={!formValues.supplierId}
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
              <Typography variant="subtitle2" fontWeight={700}>
                MONTO DE LA FACTURA
              </Typography>
            </Stack>
            <AmountSummaryRow>
              <Typography variant="body2" color="text.secondary">
                Subtotal (sin IVA)*
              </Typography>
              <Typography variant="body2">
                {numeral(formValues.subtotal).format("$0,0.00")}
              </Typography>
            </AmountSummaryRow>
            <AmountSummaryRow>
              <Typography variant="body2" color="text.secondary">
                IVA
              </Typography>
              <Typography variant="body2">
                {numeral(formValues.vat).format("$0,0.00")}
              </Typography>
            </AmountSummaryRow>
            <AmountSummaryRow>
              <Typography variant="subtitle1" fontWeight={700}>
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {numeral(formValues.total).format("$0,0.00")}
              </Typography>
            </AmountSummaryRow>
            {
              formErrors.total &&
              <Typography variant="caption" color="error">
                {formErrors.total}
              </Typography>
            }
          </AmountSummaryCard>

          <FormTextField
            label="Fecha de emisión"
            value={formatDisplayDate(formValues.issuedAt)}
            disabled
            InputProps={{ readOnly: true }}
          />

          <Button
            variant="text"
            color="primary"
            onClick={() => {
              setStep("uploadXml");
              setXmlFiles([]);
              setPdfFiles([]);
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
            disabled={saving || parsing}
            sx={{ py: 1.5, mt: 0.5 }}>
            {
              saving
                ? <CircularProgress size={20} color="inherit" />
                : "Enviar solicitud"
            }
          </Button>
        </Stack>
      }
    </SideModal>
  );
}
