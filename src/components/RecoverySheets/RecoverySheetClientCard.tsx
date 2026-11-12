import { Skeleton, Typography } from "@mui/material";
import {
  ClientFactsGrid,
  FactItem,
  LinkedCard,
} from "./styles";

export interface RecoverySheetClientCardProps {
  customerName?: string | null;
  customerAddress?: string | null;
  loading?: boolean;
}

export function RecoverySheetClientCard({
  customerName,
  customerAddress,
  loading = false,
}: RecoverySheetClientCardProps) {
  return (
    <LinkedCard>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>
        Cliente
      </Typography>

      <ClientFactsGrid>
        <FactItem>
          <Typography variant="body2" color="text.secondary">
            Nombre
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="70%" height={22} />
          ) : (
            <Typography variant="body2" fontWeight={600}>
              {customerName?.trim() || "—"}
            </Typography>
          )}
        </FactItem>

        <FactItem>
          <Typography variant="body2" color="text.secondary">
            Dirección
          </Typography>
          {loading ? (
            <Skeleton variant="text" width="90%" height={22} />
          ) : (
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ overflowWrap: "anywhere" }}
            >
              {customerAddress?.trim() || "—"}
            </Typography>
          )}
        </FactItem>
      </ClientFactsGrid>
    </LinkedCard>
  );
}
