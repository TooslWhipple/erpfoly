import { styled } from "@mui/material/styles";
import { DialogContent as MuiDialogContent, IconButton } from "@mui/material";
import { colors } from "@/styles/theme";

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
    alignItems: "flex-start",
    gap: 16,
});

export const CloseButton = styled(IconButton)(({ theme }) => ({
    width: "40px",
    height: "40px",
    padding: "16px 8px",
    border: `1px solid ${colors.border}`,
    borderRadius: "8px",
    color: theme.palette.text.primary,
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const StatsContainer = styled('div')({
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "24px",
    padding: "16px",
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
});

export const StatItem = styled('div')({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

export const ModalActions = styled('div')({
    display: "flex",
    justifyContent: "flex-start",
    gap: "16px",
    marginTop: "24px"
});



