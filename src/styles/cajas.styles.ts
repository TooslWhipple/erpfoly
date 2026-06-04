import { styled } from "@mui/material/styles";
import { TextField, Typography, Button, LinearProgress } from "@mui/material";

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

export const DashboardContainer = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    width: "672px",
    maxWidth: "100%",
    margin: "0 auto",
}));

export const SearchBarContainer = styled('div')(({ theme }) => ({
    display: "flex",
    gap: "16px",
    alignItems: "center",
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    border: `1px solid ${theme.palette.app.border}`,
    padding: "8px"
}));

export const PaymentTypeSelect = styled(Button)(({ theme }) => ({
    minWidth: 120,
    height: 36,
    textTransform: "none",
    borderColor: theme.palette.app.border,
    color: theme.palette.text.primary,
    "&:hover": {
        borderColor: theme.palette.text.disabled,
    },
}));

export const SearchInput = styled(TextField)(({ theme }) => ({
    flex: 1,
    "& .MuiOutlinedInput-root": {
        backgroundColor: theme.palette.background.paper,
        height: 36,
        borderColor: 'none',
        "& fieldset": {
            border: 'none'
        },
        "&:hover fieldset": {
            border: 'none'
        },
        "&.Mui-focused fieldset": {
            border: 'none'
        },
    }
}));

export const StyledProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: "8px",
    borderRadius: "32px",
    backgroundColor: "#E4E4E7",
    "& .MuiLinearProgress-bar": {
        borderRadius: "32px",
        background: "linear-gradient(90deg, #16A34A 0%, #EAC50C 50%, #EF4444 100%)",
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

export const ViewAllLink = styled(Button)(({ theme }) => ({
    textTransform: "none",
    color: theme.palette.text.primary,
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "underline",
    },
}));

export const HistoryTable = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
}));

export const HistoryTableHeader = styled('div')(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "80px 1fr 1fr 1fr 1fr",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.app.border}`,
    marginBottom: theme.spacing(1.5),
}));

export const HistoryTableHeaderCell = styled(Typography)(({ theme }) => ({
    fontSize: "14px",
    fontWeight: 500,
    color: theme.palette.text.secondary
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
