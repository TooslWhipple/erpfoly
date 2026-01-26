import { styled } from "@mui/material/styles";
import { Box, Paper, Typography, Button, IconButton, RadioGroup, FormControlLabel, Radio, Switch, TextField, TableCell, TableRow, TableContainer } from "@mui/material";
import { colors } from "@/styles/theme";

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export const BreadcrumbsContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(1),
}));

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

export const SaveButton = styled(Button)(({ theme }) => ({
    height: 40,
    minWidth: 112,
    fontWeight: 600,
}));

export const DiscardButton = styled(Button)(({ theme }) => ({
    height: 40,
    minWidth: 112,
    fontWeight: 600,
    marginRight: theme.spacing(1),
}));

// ============================================================================
// TABS CONTAINER
// ============================================================================

export const TabsContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(3),
}));

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export const FormCard = styled(Paper)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: theme.spacing(3),
    width: "100%",
    boxShadow: "none",
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

// ============================================================================
// RADIO BUTTONS
// ============================================================================

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

export const StyledRadioGroup = styled(RadioGroup)({
    display: "flex",
    flexDirection: "row",
    gap: 16,
});

export const StyledFormControlLabel = styled(FormControlLabel, {
    shouldForwardProp: (prop) => prop !== "checked",
})<{ checked?: boolean }>(({ theme, checked }) => ({
    margin: 0,
    padding: theme.spacing(0.75, 1.5),
    borderRadius: 8,
    border: `1px solid ${checked ? colors.sidebar.textSelected : colors.border}`,
    backgroundColor: checked ? "#F0F6FF" : "transparent",
    transition: "all 0.2s ease",
    "& .MuiFormControlLabel-label": {
        fontSize: "0.875rem",
        color: checked ? colors.sidebar.textSelected : theme.palette.text.primary,
        marginLeft: theme.spacing(1),
    },
    "&:hover": {
        backgroundColor: checked ? "#F0F6FF" : theme.palette.action.hover,
    },
}));

// ============================================================================
// GALLERY COMPONENTS
// ============================================================================

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

// ============================================================================
// BRANCHES COMPONENTS
// ============================================================================

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

// ============================================================================
// EMPTY STATES
// ============================================================================

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing(6),
    minHeight: 300,
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    textAlign: "center",
}));

export const EmptyStateText = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
}));

// ============================================================================
// COST SUMMARY COMPONENTS
// ============================================================================

export const CostSummaryContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(3),
    padding: theme.spacing(2),
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    backgroundColor: colors.background.sidebar,
    marginTop: theme.spacing(2),
    flexWrap: "wrap",
}));

export const CostItem = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
}));

export const CostLabel = styled(Typography)(({ theme }) => ({
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    fontWeight: 400,
}));

export const CostValue = styled(Typography)(({ theme }) => ({
    fontSize: "1.25rem",
    fontWeight: 600,
    color: theme.palette.text.primary,
}));

// ============================================================================
// COST HISTORY MODAL COMPONENTS
// ============================================================================

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

// ============================================================================
// SUPPLIER MODAL COMPONENTS
// ============================================================================

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

export const SupplierAddButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.primary.main,
    padding: theme.spacing(0.5, 1),
    minWidth: "auto",
    "&:hover": {
        backgroundColor: "transparent",
        textDecoration: "underline",
    },
}));

export const SupplierNewButton = styled(Button)(({ theme }) => ({
    textTransform: "none",
    fontSize: "0.875rem",
    fontWeight: 600,
    padding: theme.spacing(0.5, 2),
    minWidth: "auto",
}));
