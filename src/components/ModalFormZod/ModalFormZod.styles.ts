import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";

export const SubmitButton = styled(Button)(({ theme }) => ({
  minWidth: "136px",
  borderRadius: theme.shape.borderRadius,
  textOverflow: "ellipsis",
  overflow: "hidden",
  whiteSpace: "nowrap",
}));
