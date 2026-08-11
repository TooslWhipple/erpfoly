import { Typography } from "@mui/material";
import { EmptyState } from "./ArticlesTab.styles";

export function VueltaTab() {
  return (
    <EmptyState>
      <Typography variant="body2" color="text.secondary">
        Próximamente
      </Typography>
    </EmptyState>
  );
}
