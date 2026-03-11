import { styled } from "@mui/material/styles";
import { DialogContent as MuiDialogContent, Typography, IconButton } from "@mui/material";
import { colors } from "@/styles/theme";

export const DialogContent = styled(MuiDialogContent)({
  display: "flex",
  flexDirection: "column",
  padding: "24px"
});

export const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
}));

export const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary
}));

export const ModalDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));
