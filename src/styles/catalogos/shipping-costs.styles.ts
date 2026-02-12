import { styled } from "@mui/material/styles";
import { Box, Typography, TextField } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const PageHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: theme.spacing(3),
  gap: theme.spacing(2),
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
}));

export const PageTitle = styled(Typography)({
  fontSize: "1.75rem",
  fontWeight: 700,
  color: "#232325",
});

export const HeaderActions = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
}));

// ============================================================================
// SECTION
// ============================================================================

export const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
}));


// ============================================================================
// BRANCH LIST
// ============================================================================

export const BranchList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  backgroundColor: colors.background.sidebar,
  border: `1px solid ${colors.border}`,
  borderRadius: 8,
  padding: '24px',
}));

export const BranchRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${colors.border}`,
  gap: theme.spacing(2),
  "&:last-of-type": {
    borderBottom: "none",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "stretch",
  },
}));

export const ShippingCostInput = styled(TextField)(({ theme }) => ({
  width: 160,
  minWidth: 160,
  "& .MuiOutlinedInput-root": {
    height: 40,
    backgroundColor: colors.background.sidebar,
    "& fieldset": {
      borderColor: colors.border,
    },
    "&:hover fieldset": {
      borderColor: colors.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.sidebar.textSelected,
    },
  },
  "& input": {
    textAlign: "right",
  },
}));
