import { alpha, styled } from "@mui/material/styles";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Stack,
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
  height: 10,
  borderRadius: 999,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 999,
  },
}));

export const SupplierSummaryBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: theme.palette.background.lowerBlue,
  border: `1px solid ${theme.palette.app.border}`,
}));

export const UploadDashedButton = styled(Button)(({ theme }) => ({
  borderStyle: "dashed",
  borderWidth: 1.5,
  borderColor: theme.palette.primary.main,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.lowerBlue,
  borderRadius: 12,
  minHeight: 72,
  textTransform: "none",
  width: "100%",
  "&:hover": {
    borderStyle: "dashed",
    backgroundColor: theme.palette.background.lowBlue,
  },
}));

export const TotalsFooter = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  paddingTop: theme.spacing(1),
}));

export const TotalsRow = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 120px 140px",
  gap: theme.spacing(2),
  padding: theme.spacing(1.25, 2),
  borderRadius: 8,
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    gridTemplateColumns: "1fr",
  },
}));

export const SubtotalRow = styled(TotalsRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));

export const GrandTotalRow = styled(TotalsRow)(({ theme }) => ({
  backgroundColor: theme.palette.background.lowerBlue,
}));

export const BlockedPaymentsBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  backgroundColor: alpha(theme.palette.info.main, 0.08),
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
}));

export const DiscrepancyCard = styled("div")(({ theme }) => ({
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
