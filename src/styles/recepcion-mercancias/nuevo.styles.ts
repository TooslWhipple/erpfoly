import { styled } from "@mui/material/styles";
import { Box, Typography, Button, LinearProgress, TableHead, TableRow, TableCell } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

export const PageContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(3)
}));

export const HeaderSection = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing(3),
    flexWrap: "wrap",
}));

export const SupplierInfo = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    minWidth: 200,
});

export const SupplierName = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
}));

export const SupplierDate = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
}));

export const ProgressSection = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(-1),
}));

export const ProgressBarContainer = styled(Box)({
    width: "100%",
});

export const StyledProgressBar = styled(LinearProgress)({
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E4E4E7",
    "& .MuiLinearProgress-bar": {
        borderRadius: 4,
        backgroundColor: "#22C55E", // Green color
    },
});

export const BranchInfo = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
    minWidth: 200,
});

export const BranchName = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
}));

export const DeliveryDate = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
}));

export const ActionButton = styled(Button)(({ theme }) => ({
    minWidth: 200,
    textTransform: "none",
    fontWeight: 500,
    height: 40,
    [theme.breakpoints.down("sm")]: {
        width: "100%",
    },
}));

export const ContentSection = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(3),
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
}));

export const TableContainer = styled(Box)({
    width: "100%",
    overflowX: "auto",
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
});

export const StyledTableHead = styled(TableHead)({
    backgroundColor: colors.background.main,
});

export const StyledTableRow = styled(TableRow)({
    "&:hover": {
        backgroundColor: colors.background.main,
    },
});

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: `1px solid ${colors.border}`,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
}));

export const ArticleNameCell = styled(StyledTableCell)({
    fontWeight: 400,
});
