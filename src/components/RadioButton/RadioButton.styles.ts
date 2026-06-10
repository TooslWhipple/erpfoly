import { styled } from "@mui/material/styles";
import { Box, Button } from "@mui/material";

export const RadioOptionAdornment = styled("span")({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    lineHeight: 0,
});

export const RadioOptionLabel = styled("span")({
    display: "inline-flex",
    alignItems: "center",
    lineHeight: 1.2,
});

export const RadioOptionIcon = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.text.primary}`,
    backgroundColor: selected ? theme.palette.primary.main : "transparent",
    position: "relative",
    flexShrink: 0,
    alignSelf: "center",
    ...(selected && {
        "&::after": {
            content: '""',
            position: "absolute",
            width: "13px",
            height: "13px",
            border: `1px solid ${theme.palette.background.paper}`,
            borderRadius: "50%",
            backgroundColor: theme.palette.primary.main,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
        },
    }),
}));

export const RadioOptionButton = styled(Button)<{
    selected?: boolean;
    fullWidth?: boolean;
    size?: "small" | "medium";
    backgroundColor?: string;
    readOnly?: boolean;
}>(({
    theme,
    selected,
    fullWidth = false,
    size = "medium",
    backgroundColor = "transparent",
    readOnly = false,
}) => {
    const readOnlySurface = theme.palette.app.background.readOnlyControl;

    return {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: fullWidth ? 1 : "none",
        minWidth: fullWidth ? "auto" : size === "small" ? "96px" : "120px",
        minHeight: size === "small" ? "44px" : "56px",
        height: "auto",
        maxHeight: "none",
        lineHeight: 1.2,
        padding: "12px",
        borderRadius: "12px",
        border: `1px solid ${readOnly ? readOnlySurface : theme.palette.app.border}`,
        backgroundColor: readOnly
            ? readOnlySurface
            : selected
                ? theme.palette.background.lowBlue
                : backgroundColor,
        color: readOnly
            ? selected
                ? theme.palette.primary.main
                : theme.palette.text.primary
            : selected
                ? theme.palette.app.sidebar.textSelected
                : theme.palette.text.primary,
        fontWeight: selected ? 600 : 400,
        gap: "8px",
        transition: "all 0.2s ease",
        ...(readOnly && {
            pointerEvents: "none",
            cursor: "default",
        }),
        "&:hover": {
            backgroundColor: readOnly
                ? readOnlySurface
                : selected
                    ? theme.palette.background.lowBlue
                    : theme.palette.action.hover,
            ...(readOnly && {
                borderColor: readOnlySurface,
            }),
        },
    };
});

export const RadioButtonGroup = styled(Box)({
    display: "flex",
    flexDirection: "row",
    gap: "8px",
});
