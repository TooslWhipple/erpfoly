import { styled } from "@mui/material/styles";
import { Box, LinearProgress, TableHead, TableRow, TableCell } from "@mui/material";
import { colors } from "@/styles/theme";

export const StyledProgressBar = styled(LinearProgress)({
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E4E4E7",
    "& .MuiLinearProgress-bar": {
        borderRadius: 4,
        backgroundColor: "#22C55E", // Green color
    },
});

export const TableContainer = styled(Box)({
    width: "100%",
    overflowX: "auto",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
});

export const StyledTableHead = styled(TableHead)({
    backgroundColor: colors.background.sidebar,
});

export const StyledTableRow = styled(TableRow)({
    "&:hover": {
        backgroundColor: colors.background.sidebar,
    }
});

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderBottom: `1px solid ${colors.border}`,
    fontSize: "0.875rem",
    color: theme.palette.text.primary
}));

export const ArticleNameCell = styled(StyledTableCell)({
    fontWeight: 400
});
