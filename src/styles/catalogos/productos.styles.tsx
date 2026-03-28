import React from "react";
import { styled } from "@mui/material/styles";
import { Typography, Button, IconButton, TextField, TableCell, TableRow, TableContainer, Switch } from "@mui/material";
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

export const LastCostCard = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F1F5F9",
    borderRadius: "8px",
    padding: "8px 12px",
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

export const Section = styled('div')(({ theme }) => ({
    marginBottom: theme.spacing(4),
    "&:last-child": {
        marginBottom: 0,
    },
}));

export const RadioGroupContainer = styled('div')(({ theme }) => ({
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

export const StyledRadioGroup = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(2),
}));

const RadioOptionIcon = styled('div')<{ selected?: boolean }>(({ theme, selected }) => ({
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

export const GalleryGrid = styled('div')(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

export const GalleryItem = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    position: "relative",
    aspectRatio: "1",
    borderRadius: "8px",
    overflow: "hidden",
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.background.sidebar,
    cursor: "pointer",
    padding: "12px",
    "&:hover": {
        borderColor: colors.sidebar.textSelected,
        "& > div": {
            border: `1px dashed ${colors.sidebar.textSelected}`,
        },
        "& > div[data-gallery-overlay]": {
            opacity: 1,
        },
    },
}));

export const GalleryImage = styled("img")({
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "8px",
});

export const GalleryAddButton = styled('div')({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
    height: "240px",
    backgroundColor: "#F1F5F9",
    border: `1px dashed #BFDBFE`,
    borderRadius: "8px",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
});

export const GalleryOverlay = styled('div')(({ theme }) => ({
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

export const GalleryIconButton = styled('div')(({ theme }) => ({
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

export const BranchListContainer = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

export const BranchItem = styled('div')(({ theme }) => ({
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

export const InventoryControl = styled('div')(({ theme }) => ({
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

export const PackageRowMain = styled('div')({
    flex: 1,
    minWidth: 200,
});

export const PackageStatusBadge = styled('div')(({ theme }) => ({
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

export const CostHistoryTimeline = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: "16px",
    padding: "24px",
    position: "relative",
    gap: "24px"
}));

export const TimelineLine = styled('div')(({ theme }) => ({
    position: "absolute",
    left: 30,
    top: 34,
    bottom: 48,
    width: 1,
    backgroundColor: colors.border,
}));

export const TimelineItem = styled('div')(({ theme }) => ({
    position: "relative"
}));

export const TimelineDot = styled('div')(({ theme }) => ({
    position: "absolute",
    top: "10px",
    left: "1px",
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    backgroundColor: colors.border,
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

/** Assigned suppliers list (product form) — column headers */
export const SupplierAssignedHeaderCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.75rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    padding: theme.spacing(1.25, 2),
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: colors.background.sidebar,
}));

export const SupplierAssignedBodyCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: "middle",
}));

export const SupplierAssignedTableWrap = styled(TableContainer)(({ theme }) => ({
    overflow: "hidden"
}));

/** "Principal" status — amber / orange pill */
export const SupplierPrimaryBadge = styled('div')(({ theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(0.5, 1.5),
    borderRadius: 999,
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 1.2,
    backgroundColor: colors.chip.variants.infoAlt.background,
    color: colors.chip.variants.infoAlt.color,
}));

export const SupplierRemoveIconButton = styled(IconButton)(({ theme }) => ({
    width: 36,
    height: 36,
    padding: 0,
    border: `1px solid ${colors.border}`,
    borderRadius: "50%",
    color: theme.palette.text.secondary,
    backgroundColor: colors.background.sidebar,
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.error.main,
        borderColor: theme.palette.error.light,
    },
}));
