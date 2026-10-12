import { styled } from "@mui/material/styles";

export const PriceComparisonPanel = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: theme.spacing(2),
  padding: theme.spacing(0.75, 1.5),
  borderRadius: 8,
  backgroundColor: theme.palette.background.content,
}));

export const LineCard = styled("div", {
  shouldForwardProp: (prop) => prop !== "invalid",
})<{ invalid?: boolean }>(({ theme, invalid }) => ({
  border: `1px solid ${invalid ? theme.palette.error.main : theme.palette.app.border}`,
  borderRadius: 8,
  padding: theme.spacing(1.5, 1.75),
  backgroundColor: theme.palette.background.paper,
}));

export const ModalBody = styled("div")(({ theme }) => ({
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.25),
}));

export const ModalFooter = styled("div")(({ theme }) => ({
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.25),
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(1.5),
  marginTop: theme.spacing(1),
}));
