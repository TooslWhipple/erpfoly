import { alpha, styled } from "@mui/material/styles";
import {
  Alert,
  Button,
  LinearProgress,
  Stack,
  TextField,
} from "@mui/material";

export const AlertBanner = styled(Alert)(({ theme }) => ({
  borderRadius: 10,
  backgroundColor: alpha(theme.palette.warning.light, 0.14),
  color: theme.palette.warning.dark,
  border: `1px solid ${alpha(theme.palette.warning.main, 0.32)}`,
  alignItems: "center",
  padding: theme.spacing(0.5, 1.25),
  "& .MuiAlert-message": {
    width: "100%",
    padding: 0,
  },
  "& .MuiAlert-icon": {
    color: theme.palette.warning.main,
    marginRight: theme.spacing(1),
    padding: 0,
  },
}));

export const AlertActionButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  padding: theme.spacing(0.5, 1.5),
  borderColor: alpha(theme.palette.warning.main, 0.55),
  borderRadius: 8,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.warning.dark,
  "&:hover": {
    borderColor: theme.palette.warning.main,
    backgroundColor: theme.palette.background.paper,
  },
}));

export const ProgressTrack = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 999,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 999,
  },
}));

export const InvoiceCard = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  border: `1px solid ${theme.palette.app.border}`,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const InvoiceMetaRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  flexWrap: "wrap",
  width: "100%",
}));

export const UploadDashedButton = styled(Button)(({ theme }) => ({
  borderStyle: "dashed",
  borderWidth: 1.5,
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.lowerBlue,
  borderRadius: 12,
  minHeight: 56,
  textTransform: "none",
  "&:hover": {
    borderStyle: "dashed",
    backgroundColor: theme.palette.background.lowBlue,
  },
}));

export const BranchShareRow = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 80px 96px",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(1.25, 1.5),
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 10,
  backgroundColor: theme.palette.background.paper,
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
    gap: theme.spacing(1),
  },
}));

export const BranchShareList = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
}));

export const PercentageInput = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
    backgroundColor: theme.palette.background.paper,
  },
  "& input": {
    textAlign: "center",
    paddingTop: 8,
    paddingBottom: 8,
  },
}));

export const PaymentsTotalRow = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: theme.spacing(2),
  padding: theme.spacing(1.5, 2),
  borderRadius: 8,
  backgroundColor: theme.palette.action.hover,
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const SwitchRow = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(2),
  width: "100%",
}));

export const ModalSectionCard = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 16,
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
}));
