import { styled } from "@mui/material/styles";
import {
  Typography,
  Chip,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { theme } from "@/styles/theme";

export const Card = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  padding: "32px 24px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
}));

export const ActivityList = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const ActivityItemCard = styled('div')({
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  padding: "16px",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "8px",
  zIndex: 1
});

export const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: theme.shape.borderRadius,
  overflow: "hidden",
}));

export const StyledTable = styled(Table)({
  minWidth: 640,
});

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.app.chip.background,
  "& th": {
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.app.border}`,
  },
}));

export const StyledTableBody = styled(TableBody)({});

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:last-child td": {
    borderBottom: "none",
  },
  "& td": {
    padding: theme.spacing(2),
    fontSize: 14,
    borderBottom: `1px solid ${theme.palette.app.border}`,
  },
}));

export const TypeCellContent = styled('div')<{ variant: "payment" | "purchase" }>(
  ({ theme, variant }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    backgroundColor:
      variant === "payment" ? "rgba(34, 197, 94, 0.12)" : "rgba(37, 99, 235, 0.12)",
    color: variant === "payment" ? "#16a34a" : theme.palette.primary.main,
  })
);

export const InfoCard = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "12px",
  padding: "12px 24px 12px 12px",
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: "16px",
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  transition: "border-color 0.2s, background-color 0.2s",
  "&:hover": {
    borderColor: theme.palette.primary.light,
    backgroundColor: "rgba(37, 99, 235, 0.04)",
  },
}));

export const InfoCardIcon = styled('div')(({ theme }) => ({
  width: "40px",
  height: "40px",
  padding: "12px",
  borderRadius: "50%",
  backgroundColor: "#DBEAFE",
  color: theme.palette.primary.main,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const InfoCardLabel = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  textAlign: "center",
}));

export const ErrorState = styled('div')(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: theme.spacing(6),
  color: theme.palette.error.main,
  fontSize: 14,
  gap: theme.spacing(1),
}));

export const CreditBalanceBox = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.25),
  padding: theme.spacing(1.5, 2),
  borderRadius: 12,
  backgroundColor: theme.palette.background.lowGray,
  minWidth: 148,
}));
