import { styled } from "@mui/material/styles";
import { Box, TextField, Button, Select, LinearProgress, TableCell as MuiTableCell, TableContainer } from "@mui/material";
import { SALES_POS_BREAKPOINT } from "@/lib/layoutBreakpoints";

export type CashRegisterStatus = "open" | "closed";

export const CashRegisterIconContainer = styled('div')({
    width: "48px",
    height: "48px",
    backgroundColor: "#E0F2FE",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px",
    '& svg': {
        stroke: "#0284C7"
    }
})
export const Card = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    borderRadius: "12px",
    border: `1px solid ${theme.palette.app.border}`,
    padding: "24px",
    gap: "16px",
    width: "274px",
    minWidth: "274px",
    maxWidth: "100%",
    margin: "0 auto",
}));

export const FormFieldsContainer = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.5),
}));

/** Content inset for caja pages. Desktop already has ContentWrapper padding — no extra horizontal gutter. */
export const CashRegisterPageContent = styled(Box)(({ theme }) => ({
    width: "100%",
    boxSizing: "border-box",
    padding: theme.spacing(0, 0, 3),
    [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
        padding: theme.spacing(2),
    },
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(1.5),
    },
}));

export const DashboardSplit = styled('div')(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)",
    gap: theme.spacing(3),
    width: "100%",
    alignItems: "start",
    [theme.breakpoints.down(SALES_POS_BREAKPOINT)]: {
        gap: theme.spacing(2),
    },
    [theme.breakpoints.down("md")]: {
        gridTemplateColumns: "1fr",
    },
}));

export const DashboardColumn = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 0,
}));

export const DashboardPanel = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    border: `1px solid ${theme.palette.app.border}`,
    padding: theme.spacing(2.5),
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(2),
        gap: theme.spacing(1.5),
    },
}));

export const AdminActionsRow = styled("div")(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    width: "100%",
    "& > *": {
        flex: "1 1 140px",
    },
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        "& > *": {
            flex: "1 1 auto",
            width: "100%",
        },
    },
}));

export const SearchBarContainer = styled("div")(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1.5),
    alignItems: "center",
    flexWrap: "wrap",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    border: `1px solid ${theme.palette.app.border}`,
    padding: theme.spacing(1),
    minWidth: 0,
    [theme.breakpoints.down("sm")]: {
        gap: theme.spacing(1),
    },
}));

export const PaymentTypeSelect = styled(Select)(({ theme }) => ({
    minWidth: 0,
    width: 180,
    flex: "0 1 180px",
    height: 36,
    color: theme.palette.text.primary,
    "& .MuiSelect-select": {
        paddingTop: 8,
        paddingBottom: 8,
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.app.border,
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.text.disabled,
    },
    [theme.breakpoints.down("sm")]: {
        width: "100%",
        flex: "1 1 100%",
    },
}));

export const SearchInput = styled(TextField)(({ theme }) => ({
    flex: "1 1 140px",
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
        backgroundColor: theme.palette.background.paper,
        height: 36,
        borderColor: "none",
        "& fieldset": {
            border: "none",
        },
        "&:hover fieldset": {
            border: "none",
        },
        "&.Mui-focused fieldset": {
            border: "none",
        },
    },
    [theme.breakpoints.down("sm")]: {
        flex: "1 1 100%",
    },
}));

export const SearchBarButton = styled(Button)(({ theme }) => ({
    flex: "0 0 auto",
    minWidth: 88,
    [theme.breakpoints.down("sm")]: {
        width: "100%",
        minWidth: 0,
    },
}));

export const StyledProgressBar = styled(LinearProgress, {
    shouldForwardProp: (prop) => prop !== "level",
})<{ level?: "safe" | "warning" | "exceeded" }>(({ theme, level = "safe" }) => ({
    height: "8px",
    borderRadius: "32px",
    backgroundColor: theme.palette.app.border,
    "& .MuiLinearProgress-bar": {
        borderRadius: "32px",
        backgroundColor:
            level === "exceeded"
                ? theme.palette.error.main
                : level === "warning"
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
    },
}));

export const BalanceInfoContainer = styled('div')(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        gap: theme.spacing(2),
    },
}));

export const BalanceInfoItem = styled('div')(({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
}));

export const DashboardHistoryTableContainer = styled(TableContainer, {
    shouldForwardProp: (prop) => prop !== "hasFade",
})<{ hasFade?: boolean }>(({ hasFade }) => ({
    width: "100%",
    maxWidth: "100%",
    overflowX: "auto",
    ...(hasFade
        ? {
            maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
        }
        : {}),
}));

export const HistoryTableCard = styled("div")(({ theme }) => ({
    display: "block",
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "16px",
    border: `1px solid ${theme.palette.app.border}`,
    padding: theme.spacing(2.5),
    [theme.breakpoints.down("sm")]: {
        padding: theme.spacing(2),
    },
}));

export const ViewAllLink = styled(Button)(({ theme }) => ({
    textTransform: "none",
    color: theme.palette.text.primary,
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "underline",
    },
}));

export const TableHeaderCell = styled(MuiTableCell)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 500,
    color: theme.palette.text.secondary,
    borderBottom: `1px solid ${theme.palette.app.border}`,
    padding: "10px 8px",
    whiteSpace: "nowrap",
}));

export const TableCell = styled(MuiTableCell)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.app.border}`,
    padding: "10px 8px",
    whiteSpace: "nowrap",
}));

export const BreakdownItem = styled('div')(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    borderBottom: `1px solid ${theme.palette.app.border}`,
}));

export const ShortageCard = styled('div')(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.palette.background.lowGray,
    borderRadius: "8px",
    padding: "16px",
}));

export const CurrentCashCard = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "8px",
    padding: "8px 16px"
}));

export const DenominationItem = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "12px 16px"
}));

export const DenominationBadge = styled('div')(({ theme }) => ({
    borderRadius: "2px",
    padding: "4px",
    textAlign: "center"
}));

export const WithdrawalTotalCard = styled('div')(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: theme.palette.background.lowGray,
    borderRadius: "8px",
    gap: "8px",
    padding: "16px",
}));

export const WithdrawalAmountInput = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        justifyContent: "center",

        "& fieldset": {
            border: "none",
        },
    },

    "& .MuiInputAdornment-root": {
        marginRight: 0,
    },

    "& .MuiInputBase-input": {
        fontSize: "48px",
        fontWeight: 400,
        textAlign: "center",
        width: "auto",
        minWidth: "1ch",
        padding: 0,
    },
});
