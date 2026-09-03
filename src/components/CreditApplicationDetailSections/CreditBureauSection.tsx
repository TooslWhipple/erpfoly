import { Button, Divider, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { VerifiedRow, VerifiedCheck, VerifiedThumb } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { AlertCircle, Check, Clock3 } from "lucide-react";

interface CreditBureauSectionProps {
  detail: CreditApplicationDetail;
  onOpenImageViewer: (
    title: string,
    subtitle: string,
    url: string,
    backgroundColor?: string,
  ) => void;
  onConsultBuro?: () => void | Promise<void>;
  isConsultingBuro?: boolean;
}

const SCORE_LEVEL_MARKER_POSITION: Record<
  CreditApplicationDetail["creditBureau"]["scoreLevel"],
  string
> = {
  poor: "12%",
  fair: "40%",
  good: "68%",
  excellent: "92%",
};

const MISSING_FIELD_LABELS: Record<string, string> = {
  bureauAuthorizationSignature: "firma de autorización",
  applicant: "datos del solicitante",
  firstName: "nombre",
  lastName: "apellido paterno",
  rfc: "RFC",
  address: "domicilio",
  street: "calle",
  postalCode: "código postal",
};

function formatMissingFields(fields: string[]): string {
  if (!fields.length) {
    return "";
  }
  return fields
    .map((field) => MISSING_FIELD_LABELS[field] ?? field)
    .join(", ");
}

function scoreRowCopy(
  creditBureau: CreditApplicationDetail["creditBureau"],
): { title: ReactNode; subtitle: string; iconColor: string } {
  switch (creditBureau.queryStatus) {
    case "SUCCESS":
      return {
        title: (
          <>
            Buró de Crédito ha regresado un puntaje{" "}
            <strong>{creditBureau.scoreLabel}</strong>
          </>
        ),
        subtitle: creditBureau.queriedAt
          ? `Consulta realizada el ${new Date(creditBureau.queriedAt).toLocaleString("es-MX")}`
          : "Consulta vigente para este cliente",
        iconColor: "#059669",
      };
    case "FAILED":
      return {
        title: (
          <>
            La consulta a Buró de Crédito falló (
            <strong>{creditBureau.scoreLabel}</strong>)
          </>
        ),
        subtitle:
          "La aprobación permanece bloqueada hasta obtener una consulta exitosa. Puedes reintentar la consulta.",
        iconColor: "#DC2626",
      };
    default:
      if (creditBureau.canQueryNow) {
        return {
          title: (
            <>
              Consulta pendiente — los datos ya están listos (
              <strong>{creditBureau.scoreLabel}</strong>)
            </>
          ),
          subtitle:
            "La consulta no se ejecutó en el alta. Puedes consultarla ahora.",
          iconColor: "#D97706",
        };
      }
      return {
        title: (
          <>
            Consulta pendiente — faltan datos (
            <strong>{creditBureau.scoreLabel}</strong>)
          </>
        ),
        subtitle: creditBureau.missingFields.length
          ? `Falta: ${formatMissingFields(creditBureau.missingFields)}.`
          : "Se requiere nombre, RFC y domicilio (calle + CP) además de la firma de autorización.",
        iconColor: "#D97706",
      };
  }
}

export function CreditBureauSection({
  detail,
  onOpenImageViewer,
  onConsultBuro,
  isConsultingBuro = false,
}: CreditBureauSectionProps) {
  const { creditBureau } = detail;
  const signatureUrl = creditBureau.signatureUrl;
  const hasSignature = Boolean(
    creditBureau.clientAuthorized || signatureUrl,
  );
  const signatureSubtitle = hasSignature
    ? "Firma capturada por el sistema"
    : "Se requiere la firma de autorización del cliente para consultar Buró.";
  const scoreCopy = scoreRowCopy(creditBureau);
  const StatusIcon =
    creditBureau.queryStatus === "SUCCESS"
      ? Check
      : creditBureau.queryStatus === "FAILED"
        ? AlertCircle
        : Clock3;
  const markerLeft =
    creditBureau.queryStatus === "SUCCESS"
      ? SCORE_LEVEL_MARKER_POSITION[creditBureau.scoreLevel]
      : "50%";

  const showConsultButton =
    Boolean(onConsultBuro) &&
    (creditBureau.queryStatus === "FAILED" ||
      (creditBureau.queryStatus === "NOT_QUERIED" && creditBureau.canQueryNow));

  return (
    <Stack width="100%" spacing={3}>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        gap={2}
      >
        <Stack>
          <Typography variant="h6">Buró de Crédito</Typography>
          <Typography variant="body2" color="text.secondary">
            Resultado obtenido de consulta de buró de crédito.
          </Typography>
        </Stack>
        {showConsultButton ? (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => void onConsultBuro?.()}
            disabled={isConsultingBuro}
            sx={{ flexShrink: 0 }}
          >
            {isConsultingBuro
              ? "Consultando…"
              : creditBureau.queryStatus === "FAILED"
                ? "Reintentar consulta"
                : "Consultar buró"}
          </Button>
        ) : null}
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
            {hasSignature ? (
              <Check size={18} color="#059669" strokeWidth={2} />
            ) : (
              <AlertCircle size={18} color="#D97706" strokeWidth={2} />
            )}
          </VerifiedCheck>
          <Stack>
            <Typography variant="subtitle2" fontWeight={600}>
              {hasSignature
                ? "El cliente ha autorizado la revisión de buró de Crédito"
                : "No se encontró firma de autorización de buró"}
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
            <StatusIcon size={18} color={scoreCopy.iconColor} strokeWidth={2} />
          </VerifiedCheck>
          <Stack flex={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              {scoreCopy.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {scoreCopy.subtitle}
            </Typography>
          </Stack>
          {creditBureau.queryStatus === "SUCCESS" ? (
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
                  left: markerLeft,
                  top: -4,
                  width: 4,
                  height: 16,
                  backgroundColor: "#111827",
                  borderRadius: 2,
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          ) : null}
        </VerifiedRow>
      </Stack>
    </Stack>
  );
}
