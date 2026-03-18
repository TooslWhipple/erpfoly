import { Divider, Stack, Typography } from "@mui/material";
import { VerifiedRow, VerifiedCheck, VerifiedThumb } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { Check } from "lucide-react";
import { colors } from "@/styles/theme";

interface BiometricsSectionProps {
  detail: CreditApplicationDetail;
}

export function BiometricsSection({ detail }: BiometricsSectionProps) {
  const { biometrics } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Datos Biométricos</Typography>
        <Typography variant="body2" color="text.secondary">
          Revisa los datos biométricos proporcionados, como la foto facial o las huellas dactilares. Asegúrate de
          que los datos sean consistentes y correspondan al solicitante.
        </Typography>
      </Stack>
      <Divider />
      <Stack spacing={2}>
        {biometrics.items.map((item) => (
          <VerifiedRow key={item.id} style={{ marginBottom: 0 }}>
            <VerifiedCheck>
              <Check size={14} color="#fff" strokeWidth={3} />
            </VerifiedCheck>
            <div style={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {item.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.verifiedBy}
              </Typography>
            </div>
            {item.thumbnailUrl ? (
              <VerifiedThumb src={item.thumbnailUrl} alt={item.name} />
            ) : (
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 6,
                  backgroundColor: colors.chip.background,
                  marginLeft: "auto",
                }}
              />
            )}
          </VerifiedRow>
        ))}
      </Stack>
    </Stack>
  );
}
