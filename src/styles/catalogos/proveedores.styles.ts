import { styled } from "@mui/material/styles";
import { Box, Typography, IconButton, RadioGroup, FormControlLabel } from "@mui/material";
import { theme } from "@/styles/theme";

export const FormCard = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "24px",
}));

export const RadioGroupContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

export const RadioLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

export const StyledRadioGroup = styled(RadioGroup)({
    display: "flex",
    flexDirection: "row",
    gap: 16,
});

export const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    margin: 0,
    "& .MuiFormControlLabel-label": {
        fontSize: "0.875rem",
        color: theme.palette.text.primary,
    },
}));

export const DynamicListItem = styled('div')({
    display: "flex",
    flexDirection: "column",
    gap: "8px",
});

export const DeleteButton = styled(IconButton)(({ theme }) => ({
    width: "24px",
    height: "24px",
    border: '1px solid' + theme.palette.app.border
}));

export const DeleteButtonWrapper = styled('div')(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
        position: "absolute",
        top: theme.spacing(1),
        right: theme.spacing(1),
        zIndex: 1,
    },
}));

