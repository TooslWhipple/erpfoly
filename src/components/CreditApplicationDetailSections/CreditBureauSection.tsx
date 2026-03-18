import { Divider, Stack, Typography } from "@mui/material";
import { VerifiedRow, VerifiedCheck } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { Check } from "lucide-react";
import { colors } from "@/styles/theme";

interface CreditBureauSectionProps {
  detail: CreditApplicationDetail;
}

export function CreditBureauSection({ detail }: CreditBureauSectionProps) {
  const { creditBureau } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Buró de Crédito</Typography>
        <Typography variant="body2" color="text.secondary">
          Resultado obtenido de consulta de buró de crédito.
        </Typography>
      </Stack>
      <Divider />
      <Stack spacing={2}>
        <VerifiedRow style={{ marginBottom: 0 }}>
          <VerifiedCheck>
            <Check size={14} color="#fff" strokeWidth={3} />
          </VerifiedCheck>
          <Typography variant="body2">El cliente ha autorizado la revisión de buró de Crédito</Typography>
          <div
            style={{
              width: 80,
              height: 40,
              marginLeft: "auto",
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
            }}
          />
        </VerifiedRow>
        <VerifiedRow style={{ marginBottom: 0 }}>
          <VerifiedCheck>
            <Check size={14} color="#fff" strokeWidth={3} />
          </VerifiedCheck>
          <Typography variant="body2">
            Buró de Crédito ha regresado un puntaje <strong>{creditBureau.scoreLabel}</strong> para este cliente.
          </Typography>
          <div
            style={{
              width: 120,
              height: 8,
              borderRadius: 4,
              background: "linear-gradient(to right, #DC2626, #EA580C, #22C55E)",
              marginLeft: "auto",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 0,
                top: -4,
                width: 4,
                height: 16,
                backgroundColor: "#22C55E",
                borderRadius: 2,
              }}
            />
          </div>
        </VerifiedRow>
      </Stack>
    </Stack>
  );
}
