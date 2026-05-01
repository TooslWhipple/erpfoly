import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";
import { colors } from "@/styles/theme";

export const CheckboxOptionIcon = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
  width: 20,
  height: 20,
  borderRadius: "6px",
  border: `2px solid ${selected ? colors.sidebar.textSelected : theme.palette.text.primary}`,
  backgroundColor: selected ? colors.sidebar.textSelected : "transparent",
  position: "relative",
  flexShrink: 0,
  ...(selected && {
    "&::after": {
      content: '""',
      position: "absolute",
      width: 5,
      height: 10,
      borderRight: `2px solid ${colors.background.sidebar}`,
      borderBottom: `2px solid ${colors.background.sidebar}`,
      top: "45%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(45deg)",
    },
  }),
}));

export const CheckboxOptionButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
  minWidth: "96px",
  minHeight: "44px",
  padding: "12px",
  borderRadius: "12px",
  border: `1px solid ${colors.border}`,
  backgroundColor: selected ? colors.sidebar.itemSelected : colors.background.sidebar,
  color: selected ? colors.sidebar.textSelected : theme.palette.text.primary,
  fontWeight: selected ? 600 : 400,
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: selected ? colors.sidebar.itemSelected : theme.palette.action.hover,
  },
}));

export const CheckboxGroup = styled(Box)({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "8px",
});
