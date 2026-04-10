import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";
import { colors } from "@/styles/theme";

export const RadioOptionIcon = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: `2px solid ${selected ? colors.sidebar.textSelected : theme.palette.text.primary}`,
    backgroundColor: selected ? colors.sidebar.textSelected : "transparent",
    position: "relative",
    flexShrink: 0,
    ...(selected && {
        "&::after": {
            content: '""',
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: colors.background.sidebar,
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
    border: `1px solid ${colors.border}`,
    backgroundColor: selected ? colors.sidebar.itemSelected : colors.background.sidebar,
    color: selected ? colors.sidebar.textSelected : theme.palette.text.primary,
    fontWeight: selected ? 600 : 400,
    alignItems: "center",
    gap: "8px",
    transition: "all 0.2s ease",
    "&:hover": {
        backgroundColor: (selected) ? colors.sidebar.itemSelected : theme.palette.action.hover,
    },
}));

export const RadioButtonGroup = styled(Box)({
    display: "flex",
    flexDirection: "row",
    gap: "8px",
});
