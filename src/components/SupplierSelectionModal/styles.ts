import { alpha, styled } from "@mui/material/styles";
import { TextField, Box, Typography } from "@mui/material";

export const SupplierModalContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    marginTop: theme.spacing(2),
}));

export const SearchInput = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 8,
        backgroundColor: theme.palette.background.paper,
        "& fieldset": {
            borderColor: theme.palette.app.border,
        },
        "&:hover fieldset": {
            borderColor: theme.palette.app.border,
        },
        "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
        },
    },
}));

export const Card = styled('div')(({ theme }) => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.app.border}`,
    borderRadius: "16px",
    padding: "24px",
    [theme.breakpoints.down("sm")]: {
        padding: "0px",
        backgroundColor: "transparent",
        border: "none",
        borderRadius: "0px",
    },
}));

export const SuppliersList = styled(Box)({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    overflowX: "hidden",
    overflowY: "auto",
});

export const StatusPane = styled(Box)(({ theme }) => ({
    flex: 1,
    minHeight: 160,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    textAlign: "center",
    padding: theme.spacing(3),
}));

export const ListNotice = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(2, 1),
}));

export const SupplierListRow = styled(Box)(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "max-content minmax(0, 1fr) max-content",
    alignItems: "center",
    columnGap: theme.spacing(2),
    padding: theme.spacing(1.25, 0),
    borderBottom: `1px solid ${alpha(theme.palette.app.border, 0.45)}`,
}));

export const SupplierListHeader = styled(SupplierListRow)(({ theme }) => ({
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
}));

export const SupplierColumnLabel = styled(Typography)(({ theme }) => ({
    fontSize: 14,
    fontWeight: 600,
    color: theme.palette.text.secondary,
}));

export const SupplierIdText = styled(Typography)({
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
});

export const SupplierNameText = styled(Typography)({
    fontSize: 14,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
});
