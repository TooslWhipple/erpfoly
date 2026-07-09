import { Typography } from "@mui/material";
import { Clock } from "lucide-react";
import { BannerContainer, StatusBadge } from "./styles";

export interface DiscountRequestStatusBannerProps {
  motivo: string;
  estado: string;
  warning?: string;
}

export function DiscountRequestStatusBanner({
  motivo,
  estado,
  warning,
}: DiscountRequestStatusBannerProps) {
  return (
    <BannerContainer>
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
      <StatusBadge>
        <Clock size={16} />
        <span>{estado}</span>
      </StatusBadge>
    </BannerContainer>
  );
}
