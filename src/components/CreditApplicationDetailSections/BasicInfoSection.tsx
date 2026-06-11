import { Divider, Grid, Stack, Typography } from "@mui/material";
import { FormTextField } from "@/components";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { Check } from "lucide-react";
import { theme } from "@/styles/theme";

interface BasicInfoSectionProps {
  detail: CreditApplicationDetail;
}

export function BasicInfoSection({ detail }: BasicInfoSectionProps) {
  const { basicInfo } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Información básica</Typography>
        <Typography variant="body2" color="text.secondary">Información básica sobre el cliente.</Typography>
      </Stack>
      <Divider />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Nombres" value={basicInfo.firstName} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Primer Apellido" value={basicInfo.firstSurname} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Segundo Apellido" value={basicInfo.secondSurname} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Fecha de Nacimiento" value={basicInfo.birthDate} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="Estado Civil" value={basicInfo.maritalStatus} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="CURP" value={basicInfo.curp} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField label="RFC" value={basicInfo.rfc} readOnly fullWidth />
        </Grid>
      </Grid>
      <Typography variant="subtitle1">Datos de contacto</Typography>
      <FormTextField label="Correo electrónico" value={basicInfo.email} readOnly fullWidth />
      <Grid container spacing={2} wrap="nowrap" alignItems="flex-end">
        <Grid size={{ xs: 12, sm: 4 }}>
          <FormTextField label="Número de Whatsapp" value={basicInfo.whatsapp} readOnly fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {
            basicInfo.whatsappValidated && (
              <div
                style={{
                  width: "100%",
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "16px",
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: '#0596690F',
                  color: theme.palette.app.chip.variants.success.color,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: '#05966929'
                }}>
                  <Check size={14} />
                </div>
                <Typography variant="body2" color="success">Whatsapp validado</Typography>
              </div>
            )
          }
        </Grid>
      </Grid>
    </Stack>
  );
}
