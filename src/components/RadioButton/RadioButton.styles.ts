import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";

export const RadioOptionIcon = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: `2px solid ${selected ? theme.palette.app.sidebar.textSelected : theme.palette.text.primary}`,
    backgroundColor: selected ? theme.palette.app.sidebar.textSelected : "transparent",
    position: "relative",
    flexShrink: 0,
    ...(selected && {
        "&::after": {
            content: '""',
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: theme.palette.app.background.sidebar,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
        },
    }),
}));

export const RadioOptionButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
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
        backgroundColor: (selected) ? theme.palette.app.sidebar.itemSelected : theme.palette.action.hover,
    },
}));

export const RadioButtonGroup = styled(Box)({
    display: "flex",
    flexDirection: "row",
    gap: "8px",
});
