import {
    Autocomplete,
    TextField,
    Stack,
    InputAdornment,
    type AutocompleteRenderInputParams,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import {
    ChipsContainer,
    EmptyChipsText,
    FieldLabel,
    StyledChip,
} from "./MultiSelectAutocomplete.styles";

export interface SelectableItem {
    id: string | number;
    label: string;
}

export interface MultiSelectAutocompleteProps {
    label?: string;
    placeholder?: string;
    items: SelectableItem[];
    selectedIds: (string | number)[];
    onChange: (selectedIds: (string | number)[]) => void;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    emptyText?: string;
    emptyChipsText?: string;
}

export function MultiSelectAutocomplete({
    label,
    placeholder = "Buscar",
    items,
    selectedIds,
    onChange,
    disabled = false,
    error = false,
    helperText,
    emptyText = "No hay opciones",
    emptyChipsText = "No hay elementos seleccionados",
}: MultiSelectAutocompleteProps) {
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));

    const handleChange = (_: unknown, value: SelectableItem[]) => {
        onChange(value.map((item) => item.id));
    };

    const handleRemoveChip = (id: string | number) => {
        if (disabled) return;
        onChange(selectedIds.filter((selectedId) => selectedId !== id));
    };

    return (
        <Stack direction="column">
            {label && <FieldLabel>{label}</FieldLabel>}
            <Autocomplete
                multiple
                options={items}
                value={selectedItems}
                onChange={handleChange}
                disabled={disabled}
                getOptionLabel={(option) =>
                    typeof option === "object" ? option.label : ""
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterSelectedOptions
                size="small"
                noOptionsText={emptyText}
                renderInput={(params: AutocompleteRenderInputParams) => {
                    const { InputProps, ...restParams } = params;
                    return (
                        <TextField
                            {...restParams}
                            placeholder={placeholder}
                            error={error}
                            helperText={helperText}
                            variant="outlined"
                            slotProps={{
                                input: {
                                    ...InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon fontSize="small" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    );
                }}
                renderValue={() => null}
            />

            <ChipsContainer
                sx={{
                    marginTop: label ? 1 : 0,
                    borderColor: error ? "error.main" : undefined,
                    opacity: disabled ? 0.6 : 1,
                }}
            >
                {selectedItems.length === 0 ? (
                    <EmptyChipsText>{emptyChipsText}</EmptyChipsText>
                ) : (
                    selectedItems.map((item) => (
                        <StyledChip
                            key={item.id}
                            label={item.label}
                            onDelete={
                                disabled
                                    ? undefined
                                    : () => handleRemoveChip(item.id)
                            }
                            deleteIcon={<CloseIcon />}
                        />
                    ))
                )}
            </ChipsContainer>
        </Stack>
    );
}
