import { styled } from "@mui/material/styles";
import { Box, Typography, Chip } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// PAGE CONTAINER
// ============================================================================

export const DetailContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3),
}));

// ============================================================================
// HEADER STYLES
// ============================================================================

export const HeaderSection = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: theme.spacing(2),
    gap: theme.spacing(2),
}));

export const ProductHeader = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
}));

export const ProductInfo = styled(Box)({
    flex: 1,
});


export const ProductCategories = styled(Box)({
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
});

export const CategoryChip = styled(Chip)(({ theme }) => ({
    height: 24,
    fontSize: "12px",
    fontWeight: 500,
    backgroundColor: colors.chip.background,
    borderRadius: 6,
    color: colors.chip.text,
    "& .MuiChip-icon": {
        marginLeft: 6,
        fontSize: 14,
    },
}));

export const StatusChip = styled(Chip)<{ status: "active" | "inactive" }>(
    ({ theme, status }) => ({
        height: 24,
        fontSize: "12px",
        fontWeight: 500,
        backgroundColor: status === "active" ? "#DCFCE7" : "#F3F4F6",
        borderRadius: 6,
        color: status === "active" ? "#16A34A" : "#6B7280"
    })
);


export const SummaryCard = styled(Box)({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    height: "100%",
});

export const SummaryCardIcon = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: "24px",
    right: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme.palette.text.secondary,
    "& svg": {
        fontSize: 20,
    },
}));

// ============================================================================
// TAB CONTENT STYLES
// ============================================================================

export const TabContent = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(3),
}));


// ============================================================================
// GALLERY STYLES
// ============================================================================

export const GalleryContainer = styled(Box)({
    display: "flex",
    gap: 12,
    overflowX: "auto",
    paddingBottom: 8,
    "&::-webkit-scrollbar": {
        height: 6,
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: colors.background.main,
        borderRadius: 3,
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: colors.border,
        borderRadius: 3,
        "&:hover": {
            backgroundColor: "#D4D4D8",
        },
    },
});

export const GalleryImage = styled(Box)(({ theme }) => ({
    width: 120,
    height: 120,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: colors.background.main,
    border: `1px solid ${colors.border}`,
    flexShrink: 0,
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
        transform: "scale(1.05)",
        boxShadow: theme.shadows[2],
    },
    "& img": {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
}));

// ============================================================================
// PACKAGES STYLES
// ============================================================================

export const PackagesList = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 16,
});

export const PackageItem = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
}));

export const PackageIcon = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.action.hover,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    "& svg": {
        fontSize: 20,
        color: theme.palette.text.secondary,
    },
}));

export const PackageInfo = styled(Box)({
    flex: 1,
});


export const PackagePrice = styled(Box)({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
});


// ============================================================================
// PRICING STRATEGY STYLES
// ============================================================================

export const PricingGrid = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: theme.spacing(2),
}));

export const PricingItem = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 4,
});

// ============================================================================
// CONFIGURATIONS TAB - SALES BRANCHES
// ============================================================================

export const ConfigSectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: 18,
    fontWeight: 600,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
}));

export const ConfigSectionSubtitle = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
}));

export const SalesBranchList = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
}));

export const SalesBranchCard = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 12,
}));

