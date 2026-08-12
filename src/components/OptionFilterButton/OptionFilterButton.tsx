import { useState, useRef, type ReactNode } from "react";
import {
  Button,
  Popover,
  Typography,
  Stack,
  ListItem,
  ListItemButton,
  Checkbox,
} from "@mui/material";
import { ScanSearch } from "lucide-react";
import { MenuContainer, MenuHeader } from "@/components/FilterMenu/FilterMenu.styles";

export interface OptionFilterOption {
  id: string | number;
  label: string;
}

export interface OptionFilterButtonProps {
  label: string;
  title: string;
  options: OptionFilterOption[];
  selectedIds: (string | number)[];
  onChange: (selectedIds: (string | number)[]) => void;
  allOptionId?: string | number;
  allOptionLabel?: string;
  disabled?: boolean;
  icon?: ReactNode;
}

export function OptionFilterButton({
  label,
  title,
  options,
  selectedIds,
  onChange,
  allOptionId = "all",
  allOptionLabel = "Todos",
  disabled = false,
  icon,
}: OptionFilterButtonProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const open = Boolean(anchorEl);

  const selectableOptions = options.filter((opt) => opt.id !== allOptionId);
  const isAllSelected = selectedIds.includes(allOptionId);
  const selectedWithoutAll = selectedIds.filter((id) => id !== allOptionId);
  const areAllOptionsSelected =
    selectedWithoutAll.length > 0 &&
    selectedWithoutAll.length === selectableOptions.length;

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([allOptionId, ...selectableOptions.map((opt) => opt.id)]);
    }
  };

  const handleToggleOption = (optionId: string | number) => {
    if (optionId === allOptionId) {
      handleToggleAll();
      return;
    }

    const currentSelection = selectedIds.filter((id) => id !== allOptionId);
    const isCurrentlySelected = currentSelection.includes(optionId);

    const newSelectedIds = isCurrentlySelected
      ? currentSelection.filter((id) => id !== optionId)
      : [...currentSelection, optionId];

    if (newSelectedIds.length === selectableOptions.length) {
      onChange([allOptionId, ...newSelectedIds]);
    } else {
      onChange(newSelectedIds);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const getButtonLabel = () => {
    if (
      isAllSelected ||
      (selectedWithoutAll.length === selectableOptions.length &&
        selectableOptions.length > 0) ||
      selectedWithoutAll.length === 0
    ) {
      return label;
    }

    if (selectedWithoutAll.length === 1) {
      const selected = options.find((opt) => opt.id === selectedWithoutAll[0]);
      return selected?.label || label;
    }

    return `${selectedWithoutAll.length} seleccionados`;
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outlined"
        size="small"
        startIcon={icon ?? <ScanSearch size={16} />}
        disabled={disabled}
        onClick={handleOpen}
      >
        {getButtonLabel()}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            marginTop: "8px",
          },
        }}
      >
        <MenuContainer>
          <MenuHeader>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
            <Button
              variant="text"
              size="small"
              onClick={handleClear}
              disabled={selectedIds.length === 0}
            >
              Limpiar
            </Button>
          </MenuHeader>

          <Stack>
            <ListItem disablePadding>
              <ListItemButton onClick={handleToggleAll}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={areAllOptionsSelected && !isAllSelected}
                />
                <Typography variant="body2" fontWeight={400}>
                  {allOptionLabel}
                </Typography>
              </ListItemButton>
            </ListItem>

            {selectableOptions.map((option) => {
              const isSelected = selectedIds.includes(option.id);
              return (
                <ListItem key={option.id} disablePadding>
                  <ListItemButton onClick={() => handleToggleOption(option.id)}>
                    <Checkbox checked={isSelected} />
                    <Typography variant="body2" fontWeight={400}>
                      {option.label}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Stack>
        </MenuContainer>
      </Popover>
    </>
  );
}
