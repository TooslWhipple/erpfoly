import { styled } from "@mui/material/styles";
import {
  Typography,
  IconButton,
  DialogContent as MuiDialogContent,
} from "@mui/material";

export const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: 0,
  "&:first-of-type": {
    paddingTop: theme.spacing(3),
  },
}));

export const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const ModalDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

export const ItemNameHighlight = styled("span")(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));
