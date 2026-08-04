import { useState, useMemo } from "react";
import { Button, InputAdornment, Stack } from "@mui/material";
import { X as DeleteIcon, Plus, Search as SearchIcon } from "lucide-react";
import {
    AvailableChip,
    AvailableContainer,
    EmptyText,
    ErrorText,
    HelperText,
    Label,
    LabelRow,
    SearchField,
    SelectedChip,
    SelectedContainer,
} from "./MultiSelectChips.styles";

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
    searchPlaceholder = "Buscar",
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

    const areAllItemsSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

    const handleToggleAll = () => {
        if (disabled) return;
        onChange(areAllItemsSelected ? [] : items.map((item) => item.id));
    };

    return (
        <Stack spacing={1}>
            {label || items.length > 0 ? (
                <LabelRow>
                    {label && <Label>{label}</Label>}
                    {items.length > 0 && (
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleToggleAll}
                            disabled={disabled}
                        >
                            {areAllItemsSelected ? "Quitar todas" : "Seleccionar todas"}
                        </Button>
                    )}
                </LabelRow>
            ) : null}

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
