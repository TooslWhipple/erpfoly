import { Button, Stack, Typography } from "@mui/material";
import { CircleAlert, CircleCheck, UserRound } from "lucide-react";
import {
  StatusCardContainer,
  StatusCardContent,
  StatusCardTextContainer,
  StatusIconContainer,
  type CreditApplicationStatusCardVariant,
} from "./styles";

export interface CreditApplicationStatusCardProps {
  variant: CreditApplicationStatusCardVariant;
  approvedBaseCreditLineAmount?: number | null;
  onGoToProfile?: () => void;
  disableGoToProfile?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CreditApplicationStatusCard({
  variant,
  approvedBaseCreditLineAmount,
  onGoToProfile,
  disableGoToProfile = false,
}: CreditApplicationStatusCardProps) {
  const isApproved = variant === "approved";
  const baseCreditLineAmount = approvedBaseCreditLineAmount ?? 0;
  const title = isApproved ? "Solicitud aprobada" : "Se ha rechazado esta solicitud de crédito";
  const description = isApproved
    ? `La solicitud de crédito se ha aprobado con una línea base de $${formatCurrency(baseCreditLineAmount)} MXN. Consulta el nuevo perfil de cliente ahora.`
    : "Esta solicitud ha sido rechazada, ésta persona podrá hacer otro intento de solicitud dentro de 3 meses.";

  return (
    <StatusCardContainer variant={variant}>
      <StatusCardContent direction={{ xs: "column", md: "row" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <StatusIconContainer variant={variant}>
            {isApproved ? <CircleCheck size={18} /> : <CircleAlert size={18} />}
          </StatusIconContainer>
          <StatusCardTextContainer>
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </StatusCardTextContainer>
        </Stack>
        {isApproved && onGoToProfile && (
          <Button
            variant="outlined"
            onClick={onGoToProfile}
            disabled={disableGoToProfile}
            startIcon={<UserRound size={16} />}
          >
            Ir a Perfil
          </Button>
        )}
      </StatusCardContent>
    </StatusCardContainer>
  );
}
