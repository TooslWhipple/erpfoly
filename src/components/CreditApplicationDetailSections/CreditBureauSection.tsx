import { Divider, Stack, Typography } from "@mui/material";
import { VerifiedRow, VerifiedCheck, VerifiedThumb } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { Check } from "lucide-react";

interface CreditBureauSectionProps {
  detail: CreditApplicationDetail;
  onOpenImageViewer: (
    title: string,
    subtitle: string,
    url: string,
    backgroundColor?: string,
  ) => void;
}

export function CreditBureauSection({ detail, onOpenImageViewer }: CreditBureauSectionProps) {
  const { creditBureau } = detail;
  const signatureUrl = creditBureau.signatureUrl;
  const signatureSubtitle = "Firma capturada por el sistema";

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
        <VerifiedRow
          style={{
            marginBottom: 0,
            cursor: signatureUrl ? "pointer" : "default",
          }}
          onClick={
            signatureUrl
              ? () =>
                  onOpenImageViewer(
                    "Firma de autorización de buró",
                    signatureSubtitle,
                    signatureUrl,
                    "#fff",
                  )
              : undefined
          }
        >
          <VerifiedCheck>
            <Check size={18} color="#059669" strokeWidth={2} />
          </VerifiedCheck>
          <Stack>
            <Typography variant="subtitle2" fontWeight={600}>
              El cliente ha autorizado la revisión de buró de Crédito
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {signatureSubtitle}
            </Typography>
          </Stack>
          {signatureUrl ? (
            <VerifiedThumb
              src={signatureUrl}
              alt="Firma de autorización de buró"
              style={{ objectFit: "contain", backgroundColor: "#fff" }}
            />
          ) : null}
        </VerifiedRow>
        <VerifiedRow style={{ marginBottom: 0 }}>
          <VerifiedCheck>
            <Check size={18} color="#059669" strokeWidth={2} />
          </VerifiedCheck>
          <Stack>
            <Typography variant="subtitle2" fontWeight={600}>
              Buró de Crédito ha regresado un puntaje <strong>{creditBureau.scoreLabel}</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Consulta vigente para este cliente
            </Typography>
          </Stack>
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
