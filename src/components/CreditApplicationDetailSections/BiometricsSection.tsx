import { Divider, Stack, Typography } from "@mui/material";
import { SignedDocumentThumb } from "@/components/SignedDocumentThumb";
import { useDocumentFileOpener } from "@/hooks/useSignedDocumentFileUrl";
import { VerifiedRow, VerifiedCheck } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { Check } from "lucide-react";
import { theme } from "@/styles/theme";

interface BiometricsSectionProps {
  detail: CreditApplicationDetail;
  onOpenImageViewer: (
    title: string,
    subtitle: string,
    url: string,
    backgroundColor?: string,
  ) => void;
}

export function BiometricsSection({ detail, onOpenImageViewer }: BiometricsSectionProps) {
  const { biometrics } = detail;
  const { openWithUrl } = useDocumentFileOpener();
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Datos Biométricos</Typography>
        <Typography variant="body2" color="text.secondary">
          Revisa los datos biométricos proporcionados, como la foto facial. Asegúrate de
          que los datos sean consistentes y correspondan al solicitante.
        </Typography>
      </Stack>
      <Divider />
      <Stack spacing={2}>
        {biometrics.items.map((item) => {
          const { file } = item;
          return (
            <VerifiedRow
              key={item.id}
              style={{
                marginBottom: 0,
                cursor: file ? "pointer" : "default",
              }}
              onClick={
                file
                  ? () =>
                    void openWithUrl(file, (url) => onOpenImageViewer(item.name, item.verifiedBy, url))
                  : undefined
              }
            >
              <VerifiedCheck>
                <Check size={18} color="#059669" strokeWidth={2} />
              </VerifiedCheck>
              <Stack>
                <Typography variant="subtitle2" fontWeight={600}>
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.verifiedBy}
                </Typography>
              </Stack>
              {file ? (
                <SignedDocumentThumb file={file} alt={item.name} />
              ) : (
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 6,
                    backgroundColor: theme.palette.app.chip.background,
                    marginLeft: "auto",
                  }}
                />
              )}
            </VerifiedRow>
          );
        })}
      </Stack>
    </Stack>
  );
}
