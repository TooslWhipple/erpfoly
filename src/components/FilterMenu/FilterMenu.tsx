import { useState, useRef } from "react";
import {
  Button,
  Popover,
  useTheme,
  Typography,
  Stack,
  ListItem,
  ListItemButton,
  Checkbox,
} from "@mui/material";
import { MenuContainer, MenuHeader } from "./FilterMenu.styles";
import { ListFilter } from "lucide-react";

export interface FilterOption {
  id: string | number;
  label: string;
}

export interface FilterMenuProps {
  label: string;
  title: string;
  options: FilterOption[];
  selectedIds: (string | number)[];
  onChange: (selectedIds: (string | number)[]) => void;
  allOptionId?: string | number;
  allOptionLabel?: string;
  disabled?: boolean;
}

export function FilterMenu({
  label,
  title,
  options,
  selectedIds,
  onChange,
  allOptionId = "all",
  allOptionLabel = "Todos",
  disabled = false,
}: FilterMenuProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const open = Boolean(anchorEl);

  const isAllSelected = selectedIds.includes(allOptionId);
  const areAllOptionsSelected =
    selectedIds.length > 0 &&
    selectedIds.filter((id) => id !== allOptionId).length ===
    options.filter((opt) => opt.id !== allOptionId).length;

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
      const allOptionIds = options.filter((opt) => opt.id !== allOptionId).map((opt) => opt.id);
      onChange([allOptionId, ...allOptionIds]);
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

    const totalOptions = options.filter((opt) => opt.id !== allOptionId).length;

    if (newSelectedIds.length === totalOptions) {
      onChange([allOptionId, ...newSelectedIds]);
    } else {
      onChange(newSelectedIds);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const getButtonLabel = () => {
    const selectedWithoutAll = selectedIds.filter((id) => id !== allOptionId);
    const totalOptions = options.filter((opt) => opt.id !== allOptionId).length;
    const labelText = label.toLowerCase();

    if (isAllSelected || (selectedWithoutAll.length === totalOptions && totalOptions > 0)) {
      if (labelText.includes("sucursales")) {
        return "Todas las sucursales";
      }

      if (labelText.includes("departamentos")) {
        return "Todos los departamentos";
      }

      return `Todas las ${labelText}`;
    }

    if (selectedWithoutAll.length === 0) {
      if (labelText.includes("sucursales")) {
        return "Todas las sucursales";
      }

      if (labelText.includes("departamentos")) {
        return "Todos los departamentos";
      }

      return label;
    }

    if (selectedWithoutAll.length === 1) {
      const selected = options.find((opt) => opt.id === selectedWithoutAll[0]);
      return selected?.label || label;
    }

    return `${selectedWithoutAll.length} seleccionadas`;
  };

  const isShowingAllOption = () => {
    const selectedWithoutAll = selectedIds.filter((id) => id !== allOptionId);
    const totalOptions = options.filter((opt) => opt.id !== allOptionId).length;
    const labelText = label.toLowerCase();

    const isAllSelectedState = isAllSelected || (selectedWithoutAll.length === totalOptions && totalOptions > 0) || selectedWithoutAll.length === 0;

    if (!isAllSelectedState) {
      return false;
    }

    return labelText.includes("sucursales") || labelText.includes("departamentos");
  };

  const showingAll = isShowingAllOption();
  const app = theme.palette.app;

  return (
    <>
      <Button
        ref={buttonRef}
        variant="option"
        color="inherit"
        startIcon={<ListFilter size={16} color={theme.palette.text.secondary} />}
        disabled={disabled}
        style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
        onClick={handleOpen}>
        {
          getButtonLabel()
        }
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
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            marginTop: "8px",
          },
        }}
      >
        <MenuContainer>
          <MenuHeader>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>{title}</Typography>
            <Button variant="text" size="small" onClick={handleClear} disabled={selectedIds.length === 0}>Limpiar</Button>
          </MenuHeader>

          <Stack>
            <ListItem disablePadding>
              <ListItemButton onClick={handleToggleAll}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={areAllOptionsSelected && !isAllSelected}
                />
                <Typography variant="body2" fontWeight={400}>{allOptionLabel}</Typography>
              </ListItemButton>
            </ListItem>

            {options
              .filter((opt) => opt.id !== allOptionId)
              .map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <ListItem key={option.id} disablePadding>
                    <ListItemButton onClick={() => handleToggleOption(option.id)}>
                      <Checkbox checked={isSelected} />
                      <Typography variant="body2" fontWeight={400}>{option.label}</Typography>
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
