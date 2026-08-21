import { styled } from "@mui/material/styles";
import {
  Box,
  Button,
  DialogContent as MuiDialogContent,
  IconButton,
  Typography,
} from "@mui/material";

export const StyledDialogContent = styled(MuiDialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  "&:first-of-type": {
    paddingTop: theme.spacing(3),
  },
}));

export const ModalHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: theme.spacing(2),
}));

export const ModalTitle = styled(Typography)(({ theme }) => ({
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  lineHeight: 1.3,
  flex: 1,
  minWidth: 0,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(-0.5),
  marginRight: theme.spacing(-0.5),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const ModalContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

export const DescriptionText = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}));

export const StepsList = styled("ol")(({ theme }) => ({
  margin: 0,
  paddingLeft: theme.spacing(2.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1),
}));

export const StepItem = styled("li")(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
  lineHeight: 1.5,
}));

export const ModalActions = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1.5),
  paddingTop: theme.spacing(1),
}));

export const ConfirmButton = styled(Button)({
  minWidth: 160,
  textTransform: "none",
  fontWeight: 500,
});

export const CancelButton = styled(Button)({
  minWidth: 100,
  textTransform: "none",
  fontWeight: 500,
});
