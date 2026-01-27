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
    /** Empty state text when no items are selected */
    emptyText?: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled(Box)({
    display: "flex",
    flexDirection: "column",
    gap: 8,
});

const Label = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: 4,
}));

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
    color: theme.palette.text.primary,
    height: 32,
    "& .MuiChip-deleteIcon": {
        color: theme.palette.text.secondary,
        fontSize: 16,
        "&:hover": {
            color: theme.palette.text.primary,
        },
    },
}));

const AvailableChip = styled(Chip)(({ theme }) => ({
    backgroundColor: colors.chip.background,
    border: "none",
    borderRadius: 6,
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.text.secondary,
    height: 32,
    cursor: "pointer",
    transition: "all 0.15s ease",
    paddingRight: 8,
    "& .MuiChip-label": {
        paddingLeft: 12,
        paddingRight: 8,
    },
    "& .MuiChip-deleteIcon": {
        color: theme.palette.text.secondary,
        fontSize: 16,
        marginLeft: 4,
        marginRight: 0,
        "&:hover": {
            color: theme.palette.text.secondary,
        },
    },
    "&:hover": {
        backgroundColor: colors.chip.background,
        opacity: 0.8,
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

const EmptyText = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    color: theme.palette.text.secondary,
    fontStyle: "italic",
    opacity: 0.7,
}));

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
    emptyText = "No hay elementos seleccionados",
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
                    <EmptyText>{emptyText}</EmptyText>
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
                            deleteIcon={<AddIcon />}
                            onDelete={() => handleAdd(item.id)}
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
