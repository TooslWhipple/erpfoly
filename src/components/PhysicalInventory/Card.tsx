import { styled } from "@mui/material/styles";

export const Card = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  backgroundColor: theme.palette.common.white,
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  padding: "16px",
  gap: "16px",
}));
