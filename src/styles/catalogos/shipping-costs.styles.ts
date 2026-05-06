import { styled } from "@mui/material/styles";
import { Box, Typography, TextField } from "@mui/material";
import { theme } from "@/styles/theme";

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
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.app.border}`,
  borderRadius: 8,
  padding: '24px',
}));

export const BranchRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.app.border}`,
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
    backgroundColor: theme.palette.background.paper,
    "& fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.app.border,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.app.sidebar.textSelected,
    },
  },
  "& input": {
    textAlign: "right",
  },
}));
