import { Divider, Stack, Typography } from "@mui/material";
import { VerifiedRow, VerifiedCheck, VerifiedThumb } from "@/styles/solicitudes-credito.styles";
import type { CreditApplicationDetail } from "@/types/solicitud-credito-detail.types";
import { Check } from "lucide-react";
import { colors } from "@/styles/theme";

export interface DocumentationSectionProps {
  detail: CreditApplicationDetail;
  onOpenImageViewer: (title: string, subtitle: string, url: string) => void;
}

export function DocumentationSection({ detail, onOpenImageViewer }: DocumentationSectionProps) {
  const { documentation } = detail;
  return (
    <Stack width="100%" spacing={3}>
      <Stack>
        <Typography variant="h6">Documentación</Typography>
        <Typography variant="body2" color="text.secondary">Documentos solicitados al cliente.</Typography>
      </Stack>
      <Divider />
      <Stack spacing={2}>
        {
          documentation.documents.map((doc) => (
            <VerifiedRow
              key={doc.id}
              style={{ cursor: "pointer", marginBottom: 0 }}
              onClick={() => onOpenImageViewer(doc.name, doc.verifiedBy, doc.fullImageUrl)}>
              <VerifiedCheck>
                <Check size={18} color="#059669" strokeWidth={2} />
              </VerifiedCheck>
              <Stack>
                <Typography variant="subtitle2" fontWeight={600}>{doc.name}</Typography>
                <Typography variant="caption" color="text.secondary">{doc.verifiedBy}</Typography>
              </Stack>

              <VerifiedThumb src={doc.thumbnailUrl} alt={doc.name} />
            </VerifiedRow>
          ))
        }
      </Stack>
    </Stack>
  );
}
