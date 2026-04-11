import { styled } from "@mui/material/styles";
import { Box, TextField, Typography, Chip, Button, LinearProgress, IconButton, DialogContent as MuiDialogContent } from "@mui/material";
import { colors } from "@/styles/theme";

export type CashRegisterStatus = "open" | "closed";

export const StatusChip = styled(Chip)<{ statusType: CashRegisterStatus }>(({ statusType }) => {
    const statusStyles: Record<CashRegisterStatus, { bg: string; text: string }> = {
        open: { bg: "#DCFCE7", text: "#16A34A" },
        closed: { bg: "#F4F4F5", text: "#71717A" },
    };
    const style = statusStyles[statusType];
    return {
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 500,
        fontSize: "0.813rem",
        borderRadius: "12px",
        height: 24,
        "& .MuiChip-label": {
            padding: "0 10px",
        },
    };
});

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
    border: `1px solid ${colors.border}`,
    padding: "24px",
    gap: "16px",
    width: "274px",
    minWidth: "274px",
    maxWidth: "100%",
    margin: "0 auto",
}));

export const FormFieldsContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2.5),
}));

export const DashboardContainer = styled(Box)(({ theme }) => ({
    width: 672,
    maxWidth: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
}));

export const SearchBarContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(1.5),
    alignItems: "center",
    backgroundColor: colors.background.sidebar,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
    padding: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
}));

export const PaymentTypeSelect = styled(Button)(({ theme }) => ({
    minWidth: 120,
    height: 36,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    borderColor: colors.border,
    color: theme.palette.text.primary,
    "&:hover": {
        borderColor: theme.palette.text.disabled,
    },
}));

export const SearchInput = styled(TextField)(({ theme }) => ({
    flex: 1,
    "& .MuiOutlinedInput-root": {
        backgroundColor: colors.background.sidebar,
        height: 36,
        "& fieldset": {
            borderColor: colors.border,
        },
        "&:hover fieldset": {
            borderColor: theme.palette.text.disabled,
        },
        "&.Mui-focused fieldset": {
            borderColor: colors.sidebar.textSelected,
        },
    },
    "& .MuiOutlinedInput-input": {
        padding: "8px 12px",
        fontSize: "0.875rem",
    },
}));

export const SearchButton = styled(Button)(({ theme }) => ({
    height: 36,
    minWidth: 100,
    fontWeight: 600,
}));

export const BalanceCard = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
    padding: theme.spacing(2.5),
    marginBottom: theme.spacing(3),
}));

export const ProgressBarContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2.5),
}));

export const ProgressBarLabels = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(0.75),
}));

export const ProgressBarLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    fontWeight: 500,
}));

export const StyledProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E4E4E7",
    "& .MuiLinearProgress-bar": {
        borderRadius: 4,
        background: "linear-gradient(90deg, #22C55E 0%, #F59E0B 100%)",
    },
}));

export const BalanceInfoContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing(4),
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        gap: theme.spacing(2),
    },
}));

export const BalanceInfoItem = styled(Box)(({ theme }) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
}));

export const BalanceLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
}));

export const BalanceValue = styled(Typography)(({ theme }) => ({
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.text.primary,
}));

export const ActionsContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
    },
}));

export const ActionButton = styled(Button)(({ theme }) => ({
    flex: 1,
    height: 40,
    fontWeight: 600,
}));

export const HistorySection = styled(Box)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
    padding: theme.spacing(2.5),
}));

export const HistoryHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(4),
}));

export const HistoryTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
}));

export const ViewAllLink = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: colors.sidebar.textSelected,
    padding: 0,
    minWidth: "auto",
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "underline",
    },
}));

export const HistoryTable = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
}));

export const HistoryTableHeader = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "80px 1fr 1fr 1fr 1fr",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: theme.spacing(1.5),
}));

export const HistoryTableHeaderCell = styled(Typography)(({ theme }) => ({
    fontSize: "0.813rem",
    fontWeight: 500,
    color: theme.palette.text.secondary
}));

export const EmptyHistoryMessage = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    textAlign: "center",
    padding: theme.spacing(3),
}));

export const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
    padding: theme.spacing(3),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

export const ModalHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(1),
}));

export const ModalTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    lineHeight: 1.3,
}));

export const CloseButton = styled(IconButton)(({ theme }) => ({
    marginTop: -4,
    marginRight: -8,
    color: theme.palette.text.secondary,
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const CutSection = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
}));

export const CutSectionHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}));

export const CutSectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const TotalIncomeCard = styled(Box)(({ theme }) => ({
    backgroundColor: "#F4F4F5",
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}));

export const TotalIncomeLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
}));

export const TotalIncomeValue = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 600,
}));

export const BreakdownList = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

export const BreakdownItem = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${theme.spacing(0.5)} 0`,
}));

export const BreakdownLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 400,
}));

export const BreakdownValue = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
    textAlign: "right",
}));

export const ShortageCard = styled(Box)(({ theme }) => ({
    backgroundColor: "#F4F4F5",
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}));

export const ShortageLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
}));

export const ShortageValue = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 600,
}));

export const CutModalActions = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${colors.border}`,
}));

export const CutButton = styled(Button)(({ theme }) => ({
    height: 40,
    fontWeight: 600,
}));

export const WithdrawalSection = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
}));

export const WithdrawalSectionHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}));

export const WithdrawalSectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

export const CurrentCashCard = styled(Box)(({ theme }) => ({
    backgroundColor: "#F4F4F5",
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}));

export const CurrentCashLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
}));

export const CurrentCashValue = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 600,
}));

export const WithdrawalInstruction = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
}));

export const DenominationList = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
}));

export const DenominationItem = styled(Box)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(2),
}));

export const DenominationBadge = styled(Box)(({ theme }) => ({
    borderRadius: "12px",
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    fontSize: "0.813rem",
    fontWeight: 600,
    minWidth: 40,
    textAlign: "center",
}));

export const DenominationTypeLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 400,
}));

export const DenominationControls = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
}));

export const DenominationSubtotal = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
    minWidth: 60,
    textAlign: "right",
}));

export const WithdrawalTotalCard = styled(Box)(({ theme }) => ({
    backgroundColor: "#F4F4F5",
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}));

export const WithdrawalTotalLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
}));

export const WithdrawalTotalValue = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 600,
}));

export const WithdrawalModalActions = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${colors.border}`,
}));

export const WithdrawalButton = styled(Button)(({ theme }) => ({
    height: 40,
    fontWeight: 600,
}));

export const WithdrawalAmountInput = styled(TextField)(({ theme }) => ({
    width: "100%",
    "& .MuiOutlinedInput-root": {
        backgroundColor: "#F4F4F5",
        borderRadius: theme.shape.borderRadius,
        "& fieldset": {
            borderColor: colors.border,
        },
        "&:hover fieldset": {
            borderColor: theme.palette.text.disabled,
        },
        "&.Mui-focused fieldset": {
            borderColor: colors.sidebar.textSelected,
        },
    },
}));

export const WithdrawalAmountLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
    marginBottom: theme.spacing(1),
    textAlign: "center",
}));

export const WithdrawalFieldsRow = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
    },
}));

export const AvailableAfterWithdrawalCard = styled(Box)(({ theme }) => ({
    backgroundColor: "#F4F4F5",
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1.5),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}));

export const AvailableAfterWithdrawalLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 500,
}));

export const AvailableAfterWithdrawalValue = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    fontWeight: 600,
}));
