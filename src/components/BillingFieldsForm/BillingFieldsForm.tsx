import type { ReactNode } from "react";
import { Box, Button, Grid, MenuItem, Stack, Switch, Typography } from "@mui/material";
import { QrCode } from "lucide-react";
import { FormTextField } from "@/components/Form";
import { PostalCodeSettlementFields } from "@/components/CreditApplicationForm/PostalCodeSettlementFields";
import { useNeighborhoodsByPostalCode } from "@/hooks/credit-applications/useNeighborhoodsByPostalCode";
import type { BillingFormValues } from "@/hooks/useBillingFieldsForm";

export const TAX_REGIME_OPTIONS = [
  { value: "601", label: "601 - General de Ley Personas Morales" },
  { value: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { value: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { value: "606", label: "606 - Arrendamiento" },
  { value: "607", label: "607 - Régimen de Enajenación o Adquisición de Bienes" },
  { value: "608", label: "608 - Demás ingresos" },
  { value: "610", label: "610 - Residentes en el Extranjero sin Establecimiento Permanente" },
  { value: "611", label: "611 - Ingresos por Dividendos" },
  { value: "612", label: "612 - Personas Físicas con Actividades Empresariales" },
  { value: "614", label: "614 - Ingresos por intereses" },
  { value: "616", label: "616 - Sin obligaciones fiscales" },
  { value: "621", label: "621 - Incorporación Fiscal" },
  { value: "622", label: "622 - Actividades Agrícolas, Ganaderas, Silvícolas" },
  { value: "623", label: "623 - Opcional para Grupos de Sociedades" },
  { value: "624", label: "624 - Coordinados" },
  { value: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas" },
  { value: "626", label: "626 - Régimen Simplificado de Confianza" },
];

export const CFDI_USE_OPTIONS = [
  { value: "G01", label: "G01 - Adquisición de mercancías" },
  { value: "G02", label: "G02 - Devoluciones, descuentos o bonificaciones" },
  { value: "G03", label: "G03 - Gastos en general" },
  { value: "I01", label: "I01 - Construcciones" },
  { value: "I02", label: "I02 - Mobiliario y equipo de oficina" },
  { value: "I03", label: "I03 - Equipo de transporte" },
  { value: "I04", label: "I04 - Equipo de cómputo y accesorios" },
  { value: "I08", label: "I08 - Otra maquinaria y equipo" },
  { value: "D01", label: "D01 - Honorarios médicos, dentales y gastos hospitalarios" },
  { value: "D02", label: "D02 - Gastos médicos por incapacidad o discapacidad" },
  { value: "D03", label: "D03 - Gastos funerales" },
  { value: "D04", label: "D04 - Donativos" },
  { value: "D05", label: "D05 - Intereses reales efectivamente pagados por créditos hipotecarios" },
  { value: "D07", label: "D07 - Primas por seguros de gastos médicos" },
  { value: "D10", label: "D10 - Pagos por servicios educativos" },
  { value: "P01", label: "P01 - Por definir" },
  { value: "S01", label: "S01 - Sin efectos fiscales" },
];

interface BillingFieldsFormProps {
  values: BillingFormValues;
  onChange: (field: keyof BillingFormValues, value: string | boolean) => void;
  whatsappFallbackNumber?: string;
  lockedFields?: Partial<Record<keyof BillingFormValues, boolean>>;
  beforeFields?: ReactNode;
}

export function BillingFieldsForm({
  values,
  onChange,
  whatsappFallbackNumber,
  lockedFields,
  beforeFields,
}: BillingFieldsFormProps) {
  const { data: neighborhoods = [], isPending: neighborhoodsLoading } =
    useNeighborhoodsByPostalCode(values.fiscalPostalCode);

  const isLocked = (field: keyof BillingFormValues) => Boolean(lockedFields?.[field]);

  const mergePatch = (patch: Record<string, string>) => {
    Object.entries(patch).forEach(([field, value]) =>
      onChange(field as keyof BillingFormValues, value)
    );
  };

  return (
    <Stack spacing={3}>
      {beforeFields}

      <Button
        variant="outlined"
        startIcon={<QrCode size={20} />}
        sx={{ justifyContent: "flex-start", textTransform: "none", width: "fit-content" }}
      >
        Escanear QR de Constancia de Situación Fiscal
      </Button>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="RFC"
            placeholder="Ingrese"
            value={values.rfc}
            onChange={(e) => onChange("rfc", e.target.value)}
            inputProps={{ maxLength: 13 }}
            disabled={isLocked("rfc")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            label="Nombre o Razón Social"
            placeholder="Ingrese"
            value={values.businessName}
            onChange={(e) => onChange("businessName", e.target.value)}
            disabled={isLocked("businessName")}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            select
            label="Régimen fiscal"
            value={values.taxRegimeId}
            onChange={(e) => onChange("taxRegimeId", e.target.value)}
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {TAX_REGIME_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </FormTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField
            fullWidth
            select
            label="Uso de CFDI"
            value={values.cfdiUseId}
            onChange={(e) => onChange("cfdiUseId", e.target.value)}
          >
            <MenuItem value="">
              <em>Seleccione</em>
            </MenuItem>
            {CFDI_USE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </FormTextField>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <PostalCodeSettlementFields
          postalCode={values.fiscalPostalCode}
          neighborhoodFullCode={values.fiscalNeighborhoodFullCode}
          neighborhoods={neighborhoods}
          neighborhoodsLoading={neighborhoodsLoading}
          disabled={isLocked("fiscalPostalCode")}
          fieldKeys={{
            postalCode: "fiscalPostalCode",
            neighborhoodFullCode: "fiscalNeighborhoodFullCode",
            state: "fiscalState",
            city: "fiscalCity",
          }}
          mergePatch={mergePatch}
        />
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField fullWidth label="Estado" placeholder="Selecciona" value={values.fiscalState} disabled />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormTextField fullWidth label="Ciudad" placeholder="Seleccione" value={values.fiscalCity} disabled />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <FormTextField
            fullWidth
            label="Calle"
            placeholder="Ingresa"
            value={values.fiscalStreet}
            onChange={(e) => onChange("fiscalStreet", e.target.value)}
            disabled={isLocked("fiscalStreet")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FormTextField
            fullWidth
            label="Número"
            placeholder="Ingresa"
            value={values.fiscalExternalNumber}
            onChange={(e) => onChange("fiscalExternalNumber", e.target.value)}
            disabled={isLocked("fiscalExternalNumber")}
          />
        </Grid>
      </Grid>

      <Typography variant="body2" sx={{ fontWeight: 500, mt: 2 }}>
        Enviar factura a:
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Switch
          checked={values.sendInvoiceByEmail}
          onChange={(e) => onChange("sendInvoiceByEmail", e.target.checked)}
        />
        <FormTextField
          fullWidth
          type="email"
          placeholder="Ingrese Correo electrónico"
          value={values.invoiceEmail}
          onChange={(e) => onChange("invoiceEmail", e.target.value)}
          disabled={!values.sendInvoiceByEmail}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Switch
          checked={values.sendInvoiceByWhatsapp}
          onChange={(e) => {
            onChange("sendInvoiceByWhatsapp", e.target.checked);
            onChange("invoiceWhatsappNumber", e.target.checked ? whatsappFallbackNumber ?? "" : "");
          }}
        />
        <FormTextField
          fullWidth
          placeholder="Ingrese número de Whatsapp"
          value={values.invoiceWhatsappNumber}
          onChange={(e) => onChange("invoiceWhatsappNumber", e.target.value)}
          disabled={!values.sendInvoiceByWhatsapp}
          inputProps={{ maxLength: 10 }}
        />
      </Box>
    </Stack>
  );
}
