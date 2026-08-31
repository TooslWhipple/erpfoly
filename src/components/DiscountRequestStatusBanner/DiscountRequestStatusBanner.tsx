import { Typography } from "@mui/material";
import { Ban, CheckCircle2, Clock, XCircle } from "lucide-react";
import type { DiscountRequestStatus } from "@/types/ventas.types";
import { BannerContainer, StatusBadge } from "./styles";

export interface DiscountRequestStatusBannerProps {
  motivo: string;
  estado: string;
  status: DiscountRequestStatus;
  warning?: string;
}

function StatusIcon({ status }: { status: DiscountRequestStatus }) {
  const iconProps = { size: 16 };
  if (status === "APPROVED") return <CheckCircle2 {...iconProps} />;
  if (status === "REJECTED") return <XCircle {...iconProps} />;
  if (status === "INVALIDATED") return <Ban {...iconProps} />;
  return <Clock {...iconProps} />;
}

export function DiscountRequestStatusBanner({
  motivo,
  estado,
  status,
  warning,
}: DiscountRequestStatusBannerProps) {
  return (
    <BannerContainer status={status}>
      <div>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
          Descuento solicitado
        </Typography>
        <Typography sx={{ fontSize: 15, color: "#6B7280", mt: 0.5 }}>
          Motivo: {motivo}
        </Typography>
        {warning && (
          <Typography
            sx={{ fontSize: 13, color: "#B45309", fontWeight: 600, mt: 0.5 }}
          >
            {warning}
          </Typography>
        )}
      </div>
      <StatusBadge status={status}>
        <StatusIcon status={status} />
        <span>{estado}</span>
      </StatusBadge>
    </BannerContainer>
  );
}
