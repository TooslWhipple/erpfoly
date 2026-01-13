import { styled } from "@mui/material/styles";
import { Box, Chip, Typography } from "@mui/material";
import { Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { colors } from "@/styles/theme";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SelectableItem {
    id: string | number;
    label: string;
}

export interface MultiSelectChipsProps {
    /** Label for the component */
    label?: string;
    /** All available items */
    items: SelectableItem[];
    /** Currently selected item IDs */
    selectedIds: (string | number)[];
    /** Callback when selection changes */
    onChange: (selectedIds: (string | number)[]) => void;
    /** Disable all interactions */
    disabled?: boolean;
    /** Show error state */
    error?: boolean;
    /** Helper text below component */
    helperText?: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
});

const Label = styled(Typography)({
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#232325",
    marginBottom: 4,
});

const SelectedContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: theme.spacing(2),
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    minHeight: 56,
}));

const AvailableContainer = styled(Box)({
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
});

const SelectedChip = styled(Chip)(({ theme }) => ({
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: "0.875rem",
    fontWeight: 400,
    color: "#232325",
    height: 32,
    "& .MuiChip-deleteIcon": {
        color: "#71717A",
        fontSize: 16,
        "&:hover": {
            color: "#232325",
        },
    },
}));

const AvailableChip = styled(Chip)(({ theme }) => ({
    backgroundColor: "transparent",
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    fontSize: "0.875rem",
    fontWeight: 400,
    color: "#71717A",
    height: 32,
    cursor: "pointer",
    transition: "all 0.15s ease",
    "& .MuiChip-icon": {
        color: "#71717A",
        fontSize: 16,
        marginLeft: 8,
    },
    "&:hover": {
        backgroundColor: colors.background.main,
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        "& .MuiChip-icon": {
            color: theme.palette.primary.main,
        },
    },
}));

const HelperText = styled(Typography)(({ theme }) => ({
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginTop: 4,
}));

const ErrorText = styled(HelperText)(({ theme }) => ({
    color: theme.palette.error.main,
}));

const EmptyText = styled(Typography)({
    fontSize: "0.875rem",
    color: "#9CA3AF",
    fontStyle: "italic",
});

// ============================================================================
// COMPONENT
// ============================================================================

export function MultiSelectChips({
    label,
    items,
    selectedIds,
    onChange,
    disabled = false,
    error = false,
    helperText,
}: MultiSelectChipsProps) {
    // Separate selected and available items
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));
    const availableItems = items.filter((item) => !selectedIds.includes(item.id));

    // Handle adding an item
    const handleAdd = (id: string | number) => {
        if (disabled) return;
        onChange([...selectedIds, id]);
    };

    // Handle removing an item
    const handleRemove = (id: string | number) => {
        if (disabled) return;
        onChange(selectedIds.filter((selectedId) => selectedId !== id));
    };

    return (
        <Container>
            {label && <Label>{label}</Label>}

            {/* Selected items box */}
            <SelectedContainer
                sx={{
                    borderColor: error ? "error.main" : colors.border,
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                {selectedItems.length === 0 ? (
                    <EmptyText>No hay sucursales seleccionadas</EmptyText>
                ) : (
                    selectedItems.map((item) => (
                        <SelectedChip
                            key={item.id}
                            label={item.label}
                            onDelete={disabled ? undefined : () => handleRemove(item.id)}
                            deleteIcon={<CloseIcon />}
                        />
                    ))
                )}
            </SelectedContainer>

            {/* Available items */}
            {availableItems.length > 0 && (
                <AvailableContainer>
                    {availableItems.map((item) => (
                        <AvailableChip
                            key={item.id}
                            label={item.label}
                            icon={<AddIcon />}
                            onClick={() => handleAdd(item.id)}
                            disabled={disabled}
                        />
                    ))}
                </AvailableContainer>
            )}

            {/* Helper text */}
            {helperText &&
                (error ? (
                    <ErrorText>{helperText}</ErrorText>
                ) : (
                    <HelperText>{helperText}</HelperText>
                ))}
        </Container>
    );
}
