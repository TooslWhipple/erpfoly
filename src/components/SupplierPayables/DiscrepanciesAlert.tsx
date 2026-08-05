import { Stack, Typography } from "@mui/material";
import { CircleAlert } from "lucide-react";
import { useTheme } from "@mui/material/styles";
import { AlertActionButton, AlertBanner } from "./styles";

export interface DiscrepanciesAlertProps {
  count: number;
  onReview: () => void;
  loading?: boolean;
}

export function DiscrepanciesAlert({
  count,
  onReview,
  loading = false,
}: DiscrepanciesAlertProps) {
  const theme = useTheme();

  if (!loading && count <= 0) return null;

  return (
    <AlertBanner
      severity="warning"
      icon={<CircleAlert size={16} color={theme.palette.warning.main} />}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        width="100%"
      >
        <Typography variant="body2" fontWeight={500}>
          {loading
            ? "Buscando discrepancias..."
            : `Tienes ${count} discrepancias sin resolver`}
        </Typography>
        <AlertActionButton
          variant="outlined"
          size="small"
          onClick={onReview}
          disabled={loading || count <= 0}
          sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
        >
          Revisar
        </AlertActionButton>
      </Stack>
    </AlertBanner>
  );
}
