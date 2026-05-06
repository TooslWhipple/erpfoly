import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";

export const SubmitButton = styled(Button)(({ theme }) => ({
  minWidth: 120,
  borderRadius: theme.shape.borderRadius,
}));
