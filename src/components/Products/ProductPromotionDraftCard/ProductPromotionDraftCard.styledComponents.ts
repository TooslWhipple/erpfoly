
import { styled } from "@mui/material/styles";

export const DraftCardRoot = styled('div')(({ theme }) => ({
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: theme.palette.divider,
  boxSizing: "border-box",
}));
