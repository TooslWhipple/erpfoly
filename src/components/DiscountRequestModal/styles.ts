import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";

export const ReasonCard = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.app.border}`,
  cursor: "pointer",
  transition: "border-color 0.2s, box-shadow 0.2s",
  "&:hover": {
    borderColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
  },
}));

export const ReasonCheckIcon = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: theme.palette.primary.main,
}));

export const FooterActions = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1.5),
  marginTop: "auto",
  paddingTop: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const LineCard = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.app.border}`,
  borderRadius: 12,
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
}));

export const ModalBody = styled("div")(({ theme }) => ({
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  padding: theme.spacing(0, 3, 2),
}));

export const ModalFooter = styled("div")(({ theme }) => ({
  flexShrink: 0,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 3),
  paddingBottom: `calc(${theme.spacing(2)} + env(safe-area-inset-bottom))`,
  backgroundColor: theme.palette.background.paper,
}));
