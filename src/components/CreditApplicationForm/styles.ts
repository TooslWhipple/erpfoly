import { styled } from "@mui/material/styles";

export const Card = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  padding: "24px",
  gap: "24px",
}));

export const ReferenceCard = styled("div")(({ theme }) => ({
  width: "100%",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "12px",
  padding: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  backgroundColor: theme.palette.background.paper,
}));

export const VerifiedDocumentRow = styled("div")(({ theme }) => ({
  width: "100%",
  borderRadius: "12px",
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: "#F0FDF4",
  padding: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
}));
