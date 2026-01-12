import { styled } from "@mui/material/styles";
import { DialogContent, Typography, IconButton } from "@mui/material";

export const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  "&:first-of-type": {
    paddingTop: theme.spacing(3),
  },
}));

export const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing(3),
}));

export const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
}));

export const ModalDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  marginTop: -4,
  marginRight: -8,
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));
