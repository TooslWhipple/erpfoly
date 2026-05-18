import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const ForbiddenContent = styled(Stack)(({ theme }) => ({
  minHeight: "60vh",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: theme.spacing(4),
}));
