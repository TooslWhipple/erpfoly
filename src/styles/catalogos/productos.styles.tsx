import React from "react";
import { darken, styled } from "@mui/material/styles";
import { Typography, Button, IconButton, TextField, TableCell, TableRow, TableContainer, Switch } from "@mui/material";
import { theme } from "@/styles/theme";

export const FormCard = styled('div')(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    gap: "24px",
}));

export const Card = styled('div')<{ backgroundColor?: string }>(({ backgroundColor }) => ({
    display: "flex",
    flexDirection: "column",
    backgroundColor: backgroundColor ?? theme.palette.background.paper,
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
    backgroundColor: checked ? "#FEE2E2" : theme.palette.background.paper,
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
    border: `2px solid ${selected ? theme.palette.app.sidebar.textSelected : theme.palette.text.primary}`,
    backgroundColor: selected ? theme.palette.app.sidebar.textSelected : "transparent",
    position: "relative",
    flexShrink: 0,
    ...(selected && {
        "&::after": {
            content: '""',
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: theme.palette.background.paper,
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
    border: `1px solid ${(selected) ? theme.palette.app.sidebar.itemSelected : "#E2E8F0"}`,
    backgroundColor: (selected) ? theme.palette.app.sidebar.itemSelected : "transparent",
    color: (selected) ? theme.palette.app.sidebar.textSelected : "#09090B",
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

export const BranchItem = styled('div')(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "8px",
    gap: "16px",
    [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        gap: "8px"
    },
}));

export const InventoryControl = styled('div')(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    height: 32,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "8px",
    gap: "4px",
    padding: "0 8px",
}));

export const InventoryInput = styled(TextField)(({ theme }) => ({
    width: "48px",
    "& .MuiOutlinedInput-root": {
        height: "20px",
        "& fieldset": {
            border: "none",
        },
        "&:hover fieldset": {
            border: "none",
        },
        "&.Mui-focused fieldset": {
            border: "none",
        },
        "& input": {
            textAlign: "center",
        },
    },
}));

export const EmptyStateContainer = styled('div')({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    minHeight: "72px",
    backgroundColor: theme.palette.background.content,
    borderRadius: "16px",
    textAlign: "center",
});

export const PackageRowCard = styled('div')({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
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
    backgroundColor: theme.palette.app.chip.background,
    border: `1px solid ${theme.palette.app.chip.border}`,
}));

export const PackageDeleteButton = styled(IconButton)(({ theme }) => ({
    flexShrink: 0,
    padding: "0px",
    width: "24px",
    height: "24px",
    border: `1px solid ${theme.palette.app.border}`,
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
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
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
    backgroundColor: theme.palette.app.border,
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
    backgroundColor: theme.palette.app.border,
}));

export const SupplierTableContainer = styled(TableContainer)(({ theme }) => ({
    flex: 1,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: 8,
    marginBottom: theme.spacing(2),
    overflow: "auto",
    "& .MuiTable-root": {
        minWidth: 650,
    },
}));

export const SupplierTableHeader = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.app.border}`,
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
    borderBottom: `1px solid ${theme.palette.app.border}`,
}));

/** Assigned suppliers list (product form) — column headers */
export const SupplierAssignedHeaderCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.75rem",
    fontWeight: 500,
    color: theme.palette.text.secondary,
    padding: theme.spacing(1.25, 2),
    borderBottom: `1px solid ${theme.palette.app.border}`,
    backgroundColor: theme.palette.background.paper,
}));

export const SupplierAssignedBodyCell = styled(TableCell)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.app.border}`,
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
    backgroundColor: theme.palette.app.chip.variants.infoAlt.background,
    color: theme.palette.app.chip.variants.infoAlt.color,
}));

export const SupplierRemoveIconButton = styled(IconButton)(({ theme }) => ({
    width: 36,
    height: 36,
    padding: 0,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "50%",
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.error.main,
        borderColor: theme.palette.error.light,
    },
}));
