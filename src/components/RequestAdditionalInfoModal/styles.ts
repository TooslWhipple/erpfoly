import { styled } from "@mui/material/styles";
import { Stack } from "@mui/material";
import { colors } from "@/styles/theme";

export const Card = styled(Stack, {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "24px",
  padding: "16px",
  borderRadius: "16px",
  border: `1px solid ${(selected) ? colors.sidebar.itemSelected : theme.palette.divider}`,
  backgroundColor: (selected) ? colors.sidebar.itemSelected : 'transparent',
  transition: 'border-color 0.2s, background-color 0.2s',
}));

export const IconCircle = styled('div', {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected?: boolean }>(({ theme, selected }) => ({
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: (selected) ? theme.palette.primary.main : "#E2E8F0",
  color: (selected) ? "#ffffff" : colors.text.secondary,
  transition: 'background-color 0.2s'
}));

export const FooterActions = styled('div')(({ theme }) => ({
  marginTop: "auto",
  paddingTop: theme.spacing(2),
  width: "100%",
}));
