import { styled } from "@mui/material/styles";
import { Chip } from "@mui/material";
import { colors } from "@/styles/theme";

export const DetailContainer = styled('div')({
    padding: "24px"
});

export const CategoryChip = styled(Chip)({
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
});

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


export const SummaryCard = styled('div')({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    height: "100%",
});

export const SummaryCardIcon = styled('div')(({ theme }) => ({
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

export const GalleryContainer = styled('div')({
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

export const GalleryImage = styled('div')(({ theme }) => ({
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

export const PackagesList = styled('div')({
    display: "flex",
    flexDirection: "column",
    gap: 16,
});

export const PackageItem = styled('div')(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${colors.border}`,
}));

export const PackageIcon = styled('div')(({ theme }) => ({
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

export const PackageInfo = styled('div')({
    flex: 1,
});


export const PackagePrice = styled('div')({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
});

export const PricingGrid = styled('div')(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: theme.spacing(2),
}));

export const PricingItem = styled('div')({
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
    gap: "8px"
});

export const CardContainer = styled('div')({
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "24px",
    backgroundColor: colors.background.sidebar,
    borderRadius: "16px",
    border: `1px solid ${colors.border}`
});

export const BranchCard = styled('div')(() => ({
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "8px"
}));

