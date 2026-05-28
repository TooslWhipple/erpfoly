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
}));
