import React from "react";
import { styled } from "@mui/material/styles";
import { Box, Typography, Button, IconButton, TextField, TableCell, TableRow, TableContainer, Switch } from "@mui/material";
import { colors } from "@/styles/theme";

export const FormCard = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "24px",
}));

export const Card = styled('div')<{ backgroundColor?: string }>(({ backgroundColor }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: backgroundColor ?? colors.background.sidebar,
    borderRadius: "16px",
    padding: "16px",
    gap: "12px"
}));

export const LuquidationCard = styled('div')<{ checked: boolean }>(({ checked }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: checked ? "#FEE2E2" : colors.background.sidebar,
    borderRadius: "8px",
    padding: "8px 12px",
    gap: "16px",
}));

export const LiquidationSwitch = styled(Switch)(({ theme }) => ({
    "& .MuiSwitch-switchBase.Mui-checked": {
        color: theme.palette.common.white,
        "&:hover": {
            backgroundColor: "rgba(239, 68, 68, 0.08)",
        },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
        backgroundColor: "#EF4444",
        opacity: 1,
    },
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 600,
    color: "#232325",
    marginBottom: theme.spacing(2),
}));

export const SectionDescription = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
}));

export const Section = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    "&:last-child": {
        marginBottom: 0,
    },
}));

export const RadioGroupContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1),
}));

export const RadioLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

export const StyledRadioGroup = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(2),
}));

const RadioOptionIcon = styled(Box)<{ selected?: boolean }>(({ theme, selected }) => ({
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: `2px solid ${selected ? colors.sidebar.textSelected : theme.palette.text.primary}`,
    backgroundColor: selected ? colors.sidebar.textSelected : "transparent",
    position: "relative",
    flexShrink: 0,
    ...(selected && {
        "&::after": {
            content: '""',
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: colors.background.sidebar,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
        },
    }),
}));

const StyledRadioOptionButton = styled(Button)<{ selected?: boolean }>(({ theme, selected }) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px",
    borderRadius: "12px",
    border: `1px solid ${(selected) ? colors.sidebar.itemSelected : "#E2E8F0"}`,
    backgroundColor: (selected) ? colors.sidebar.itemSelected : "transparent",
    color: (selected) ? colors.sidebar.textSelected : "#09090B",
    fontSize: "14px",
    fontWeight: (selected) ? 500 : 400,
    textTransform: "none",
    gap: "8px",
    transition: "all 0.2s ease"
}));

export interface StyledFormControlLabelProps {
    value: string;
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function StyledFormControlLabel({
    value,
    label,
    checked,
    onChange,
}: StyledFormControlLabelProps) {
    const handleClick = () => {
        onChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
        <StyledRadioOptionButton
            role="radio"
            aria-checked={checked}
            selected={checked}
            onClick={handleClick}
        >
            <RadioOptionIcon selected={checked} />
            {label}
        </StyledRadioOptionButton>
    );
}

export const GalleryGrid = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

export const GalleryItem = styled(Box)(({ theme }) => ({
    position: "relative",
    aspectRatio: "1",
    borderRadius: 8,
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.background.sidebar,
    cursor: "pointer",
    "&:hover": {
        borderColor: colors.sidebar.textSelected,
        "& > div[data-gallery-overlay]": {
            opacity: 1,
        },
    },
}));

export const GalleryImage = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "cover",
});

export const GalleryAddButton = styled(Box)(({ theme }) => ({
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: `2px dashed ${colors.border}`,
    borderRadius: 8,
    cursor: "pointer",
    transition: "border-color 0.2s ease",
    "&:hover": {
        borderColor: colors.sidebar.textSelected,
    },
}));

export const GalleryLabel = styled(Typography)(({ theme }) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "white",
    padding: theme.spacing(0.5, 1),
    fontSize: "0.75rem",
    fontWeight: 500,
    textAlign: "center",
    zIndex: 1,
}));

export const GalleryOverlay = styled(Box)(({ theme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    opacity: 0,
    transition: "opacity 0.2s ease",
    zIndex: 2,
}));

export const GalleryIconButton = styled(Box)(({ theme }) => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "& svg": {
        fontSize: 20,
        color: theme.palette.text.primary,
    },
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
        borderColor: colors.sidebar.textSelected,
    },
}));

export const HiddenFileInput = styled("input")({
    display: "none",
});

export const BranchListContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

export const BranchItem = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    gap: theme.spacing(2),
    boxShadow: "none",
}));

export const BranchName = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
    flex: 1,
}));

export const InventoryControl = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
}));

export const InventoryLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    minWidth: 40,
}));

export const InventoryInput = styled(TextField)(({ theme }) => ({
    width: 80,
    "& .MuiOutlinedInput-root": {
        height: 32,
        "& input": {
            padding: theme.spacing(0.5, 1),
            textAlign: "center",
            fontSize: "0.875rem",
        },
    },
}));

export const InventoryButton = styled(IconButton)(({ theme }) => ({
    width: 32,
    height: 32,
    padding: 0,
    border: `1px solid ${colors.border}`,
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const EmptyStateContainer = styled('div')({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    minHeight: "72px",
    backgroundColor: colors.background.content,
    borderRadius: "16px",
    textAlign: "center",
});

export const PackageRowCard = styled('div')({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "12px",
});

export const PackageRowIconBox = styled('div')({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    backgroundColor: "#DBEAFE",
    color: "#2563EB",
});

export const PackageRowMain = styled(Box)({
    flex: 1,
    minWidth: 200,
});

export const PackageStatusBadge = styled(Box)(({ theme }) => ({
    flexShrink: 0,
    maxWidth: "100%",
    padding: theme.spacing(0.75, 2),
    borderRadius: 999,
    backgroundColor: colors.chip.background,
    border: `1px solid ${colors.chip.border}`,
}));

export const PackageDeleteButton = styled(IconButton)(({ theme }) => ({
    flexShrink: 0,
    padding: "0px",
    width: "24px",
    height: "24px",
    border: `1px solid ${colors.border}`,
    color: theme.palette.text.secondary,
    transition: "all 0.2s ease",
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.error.main,
        borderColor: theme.palette.error.light,
    },
}));

export const EmptyStateText = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
}));

export const CostHistoryTimeline = styled(Box)(({ theme }) => ({
    position: "relative",
    paddingLeft: theme.spacing(3),
    marginTop: theme.spacing(2),
}));

export const TimelineLine = styled(Box)(({ theme }) => ({
    position: "absolute",
    left: 7,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: colors.border,
}));

export const TimelineItem = styled(Box)(({ theme }) => ({
    position: "relative",
    paddingBottom: theme.spacing(3),
    "&:last-child": {
        paddingBottom: 0,
    },
}));

export const TimelineDot = styled(Box)(({ theme }) => ({
    position: "absolute",
    left: -theme.spacing(3.5),
    top: 4,
    width: 14,
    height: 14,
    borderRadius: "50%",
    backgroundColor: colors.border,
    border: `2px solid ${colors.background.sidebar}`,
    zIndex: 1,
}));

export const TimelineContent = styled(Box)(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: theme.spacing(2),
}));

export const TimelineDate = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    minWidth: 150,
    marginLeft: theme.spacing(2.5),
}));

export const TimelinePrice = styled(Typography)(({ theme }) => ({
    fontSize: "1rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    flex: 1,
}));

export const TimelineChange = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    color: theme.palette.text.secondary,
    fontSize: "0.875rem",
}));

export const SupplierTableContainer = styled(TableContainer)(({ theme }) => ({
    flex: 1,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    marginBottom: theme.spacing(2),
    overflow: "auto",
    "& .MuiTable-root": {
        minWidth: 650,
    },
}));

export const SupplierTableHeader = styled(TableCell)(({ theme }) => ({
    backgroundColor: colors.background.main,
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${colors.border}`,
    padding: theme.spacing(1.5, 2),
}));

export const SupplierTableRow = styled(TableRow)(({ theme }) => ({
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td": {
        borderBottom: "none",
    },
}));

export const SupplierTableCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${colors.border}`,
}));
