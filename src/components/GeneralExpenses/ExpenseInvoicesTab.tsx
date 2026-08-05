import { useRef } from "react";
import {
  CircularProgress,
  IconButton,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import { Minus, Upload } from "lucide-react";
import numeral from "numeral";
import type { GeneralExpenseInvoice } from "@/types/general-expenses.types";
import {
  InvoiceCard,
  InvoiceMetaRow,
  SwitchRow,
  UploadDashedButton,
} from "./styles";

export interface ExpenseInvoicesTabProps {
  requiresInvoice: boolean;
  onRequiresInvoiceChange: (value: boolean) => void;
  invoices: GeneralExpenseInvoice[];
  searching?: boolean;
  searchMessage?: string;
  onRemoveInvoice: (invoiceId: string) => void;
  onUploadFiles: (files: File[]) => void;
  disabled?: boolean;
}

export function ExpenseInvoicesTab({
  requiresInvoice,
  onRequiresInvoiceChange,
  invoices,
  searching = false,
  searchMessage,
  onRemoveInvoice,
  onUploadFiles,
  disabled = false,
}: ExpenseInvoicesTabProps) {
  const theme = useTheme();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length) onUploadFiles(files);
    event.target.value = "";
  };

  return (
    <Stack spacing={2.5}>
      <SwitchRow>
        <Typography variant="body2" fontWeight={500}>
          {requiresInvoice
            ? "Este gasto sí requiere factura"
            : "Este gasto no requiere factura"}
        </Typography>
        <Switch
          checked={requiresInvoice}
          onChange={(_, checked) => onRequiresInvoiceChange(checked)}
          disabled={disabled}
          color="primary"
        />
      </SwitchRow>

      {!requiresInvoice ? (
        <Typography variant="body2" color="text.secondary">
          Este gasto se registrará sin factura asociada.
        </Typography>
      ) : (
        <Stack spacing={2}>
          {(searching || searchMessage) && (
            <Stack direction="row" spacing={1} alignItems="center">
              {searching && <CircularProgress size={16} />}
              <Typography variant="body2" color="text.secondary">
                {searching
                  ? "Buscando facturas generadas de este proveedor"
                  : searchMessage}
              </Typography>
            </Stack>
          )}

          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id}>
              <Stack spacing={0.75} flex={1} minWidth={0}>
                <InvoiceMetaRow>
                  <Typography variant="body2" fontWeight={600}>
                    ID: {invoice.externalId}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoice.date}
                  </Typography>
                </InvoiceMetaRow>
                <InvoiceMetaRow>
                  <Typography variant="body2" color="text.secondary">
                    Tipo: {invoice.paymentType}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="subtitle2">
                      {numeral(invoice.amount).format("$0,0.00")}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="Quitar factura"
                      disabled={disabled}
                      onClick={() => onRemoveInvoice(invoice.id)}
                    >
                      <Minus size={16} color={theme.palette.text.secondary} />
                    </IconButton>
                  </Stack>
                </InvoiceMetaRow>
              </Stack>
            </InvoiceCard>
          ))}

          <input
            ref={inputRef}
            type="file"
            accept=".xml,.pdf,application/xml,application/pdf,text/xml"
            hidden
            multiple
            onChange={handleFileChange}
          />

          <UploadDashedButton
            fullWidth
            variant="outlined"
            disabled={disabled}
            startIcon={<Upload size={18} color={theme.palette.primary.main} />}
            onClick={() => inputRef.current?.click()}
          >
            Cargar Factura en XML o PDF
          </UploadDashedButton>
        </Stack>
      )}
    </Stack>
  );
}
