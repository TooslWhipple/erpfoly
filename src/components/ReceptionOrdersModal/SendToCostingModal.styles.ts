import { styled } from "@mui/material/styles";
import { DialogContent as MuiDialogContent, Typography, IconButton, Box, Button } from "@mui/material";
import { theme } from "@/styles/theme";

export const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    "&:first-of-type": {
        paddingTop: theme.spacing(3),
    },
}));

export const ModalHeader = styled("div")({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
});

export const ModalTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
    color: theme.palette.text.secondary,
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const ModalContent = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

export const StatsContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
}));

export const StatItem = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
});

export const StatLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
}));

export const StatValue = styled(Typography)(({ theme }) => ({
    fontSize: "2rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.2,
}));

export const ModalActions = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "flex-end",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.app.border}`,
}));

export const CancelButton = styled(Button)(({ theme }) => ({
    minWidth: 100,
    textTransform: "none",
    fontWeight: 500,
}));

export const ConfirmButton = styled(Button)(({ theme }) => ({
    minWidth: 200,
    textTransform: "none",
    fontWeight: 500,
}));
