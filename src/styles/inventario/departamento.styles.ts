import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

export const ArticlesGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

export const RulesList = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));
