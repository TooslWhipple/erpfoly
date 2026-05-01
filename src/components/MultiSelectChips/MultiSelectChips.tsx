import { useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import { Chip, InputAdornment, Stack, TextField, Typography } from "@mui/material";
import { colors } from "@/styles/theme";
import { X as DeleteIcon, Plus, Search as SearchIcon } from "lucide-react";

export interface SelectableItem {
    id: string | number;
    label: string;
}

export interface MultiSelectChipsProps {
    label?: string;
    items: SelectableItem[];
    selectedIds: (string | number)[];
    onChange: (selectedIds: (string | number)[]) => void;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    emptyText?: string;
    searchable?: boolean;
    searchPlaceholder?: string;
}

const Label = styled(Typography)(({ theme }) => ({
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.text.primary,
    marginBottom: 4,
}));

const SelectedContainer = styled('div')<{ disabled: boolean, error: boolean }>(({ disabled, error }) => ({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    padding: "16px",
    backgroundColor: colors.background.sidebar,
    border: `1px solid ${(error) ? "error.main" : colors.border}`,
    borderRadius: "8px",
    minHeight: "56px",
    opacity: disabled ? 0.6 : 1,
}));

const AvailableContainer = styled('div')({
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
});

const SearchField = styled(TextField)({
    "& .MuiOutlinedInput-root": {
        fontSize: "14px",
        backgroundColor: colors.background.sidebar,
    },
});

const SelectedChip = styled(Chip)(({ theme }) => ({
    backgroundColor: '#E2E8F0',
    borderRadius: '4px',
    fontSize: "14px",
    fontWeight: 400,
    color: theme.palette.text.primary,
    height: 36
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

export function MultiSelectChips({
    label,
    items,
    selectedIds,
    onChange,
    disabled = false,
    error = false,
    helperText,
    emptyText = "No hay elementos seleccionados",
    searchable = false,
    searchPlaceholder = "Buscar...",
}: MultiSelectChipsProps) {
    const [searchValue, setSearchValue] = useState("");

    const selectedItems = items.filter((item) => selectedIds.includes(item.id));
    const availableItems = useMemo(() => {
        const notSelected = items.filter((item) => !selectedIds.includes(item.id));
        if (!searchable || !searchValue.trim()) return notSelected;
        const term = searchValue.trim().toLowerCase();
        return notSelected.filter((item) =>
            String(item.label).toLowerCase().includes(term),
        );
    }, [items, selectedIds, searchable, searchValue]);

    const handleAdd = (id: string | number) => {
        if (disabled) return;
        onChange([...selectedIds, id]);
    };

    const handleRemove = (id: string | number) => {
        if (disabled) return;
        onChange(selectedIds.filter((selectedId) => selectedId !== id));
    };

    return (
        <Stack spacing={1}>
            {label && <Label>{label}</Label>}

            {
                searchable &&
                <SearchField
                    size="small"
                    fullWidth
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    disabled={disabled}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        },
                    }}
                    style={{ marginBottom: "8px" }}
                />
            }

            <SelectedContainer
                disabled={disabled}
                error={error}>
                {
                    selectedItems.length === 0 ?
                        <EmptyText>{emptyText}</EmptyText>
                        :
                        selectedItems.map((item) => (
                            <SelectedChip
                                key={item.id}
                                label={item.label}
                                onDelete={disabled ? undefined : () => handleRemove(item.id)}
                                deleteIcon={<DeleteIcon size={16} />}
                            />
                        ))
                }
            </SelectedContainer>

            {
                availableItems.length > 0 &&
                <AvailableContainer>
                    {
                        availableItems.map((item) => (
                            <AvailableChip
                                key={item.id}
                                label={item.label}
                                deleteIcon={<Plus size={16} />}
                                onDelete={() => handleAdd(item.id)}
                            />
                        ))
                    }
                </AvailableContainer>
            }

            {helperText && (error) ? <ErrorText>{helperText}</ErrorText> : <HelperText>{helperText}</HelperText>
            }
        </Stack>
    );
}
