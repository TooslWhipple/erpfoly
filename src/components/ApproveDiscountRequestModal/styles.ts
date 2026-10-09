import { styled } from "@mui/material/styles";

export const PriceComparisonPanel = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 1.5),
  borderRadius: 12,
  backgroundColor: theme.palette.background.content,
}));

export const LineCard = styled("div", {
  shouldForwardProp: (prop) => prop !== "invalid",
})<{ invalid?: boolean }>(({ theme, invalid }) => ({
  border: `1px solid ${invalid ? theme.palette.error.main : theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
}));

export const ModalBody = styled("div")(({ theme }) => ({
  flex: "1 1 auto",
  minHeight: 0,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

export const ModalFooter = styled("div")(({ theme }) => ({
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
  borderTop: `1px solid ${theme.palette.divider}`,
  paddingTop: theme.spacing(2),
  marginTop: theme.spacing(1),
}));
