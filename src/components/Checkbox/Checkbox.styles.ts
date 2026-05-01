import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";

export const CheckboxOptionIcon = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
  width: 20,
  height: 20,
  borderRadius: "6px",
  border: `2px solid ${selected ? theme.palette.app.sidebar.textSelected : theme.palette.text.primary}`,
  backgroundColor: selected ? theme.palette.app.sidebar.textSelected : "transparent",
  position: "relative",
  flexShrink: 0,
  ...(selected && {
    "&::after": {
      content: '""',
      position: "absolute",
      width: 5,
      height: 10,
      borderRight: `2px solid ${theme.palette.app.background.sidebar}`,
      borderBottom: `2px solid ${theme.palette.app.background.sidebar}`,
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
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: selected ? theme.palette.app.sidebar.itemSelected : theme.palette.app.background.sidebar,
  color: selected ? theme.palette.app.sidebar.textSelected : theme.palette.text.primary,
  fontWeight: selected ? 600 : 400,
  alignItems: "center",
  gap: "8px",
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: selected ? theme.palette.app.sidebar.itemSelected : theme.palette.action.hover,
  },
}));

export const CheckboxGroup = styled(Box)({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "8px",
});
